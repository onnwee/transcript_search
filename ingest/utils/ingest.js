// Orchestrates ingest for a single YouTube video: fetch → punctuate → clean → split → align → DB → Meili
import { splitIntoSentences, alignSentencesToSegments } from "./sentences.js";
import "dotenv/config";

import { Pool } from "pg";
import { YoutubeTranscript } from "youtube-transcript";
import { cleanTranscript } from "./clean.js";
import { logger } from "./logger.js";
import { indexTranscript, indexSentenceDocuments } from "./meili.js";
import { punctuateSentences } from "./punctuate.js";
import { splitIntoChunks } from "./split.js";

logger.info(`🔧 Connecting to DB at: ${process.env.DATABASE_URL}`);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Punctuate long transcript text safely by chunking it and calling the Punctuator service.
 * - Uses size-based chunks to handle unpunctuated input.
 * - Concurrency, timeout, and retries are configurable via env.
 */
async function formatTranscript(text) {
  // Use size-based chunking (safe for unpunctuated input). Default 1000 chars.
  const chunks = splitIntoChunks(text, {
    maxChars: parseInt(process.env.PUNCTUATE_MAX_CHARS || "1000", 10),
    softMaxChars: parseInt(process.env.PUNCTUATE_SOFT_MAX || "800", 10),
  });
  const punctuated = await punctuateSentences(chunks, {
    concurrency: parseInt(process.env.PUNCTUATOR_CONCURRENCY || "3", 10),
    retries: 3,
    timeoutMs: parseInt(process.env.PUNCTUATOR_TIMEOUT_MS || "30000", 10),
  });
  return punctuated.join(" ");
}

/**
 * Ingest a single video record.
 * @param {{ video_id: string, title: string, published_at: string }} video
 */
export async function ingestVideo(video) {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(
      "SELECT 1 FROM videos WHERE video_id = $1",
      [video.video_id]
    );
    if (rows.length > 0) {
      logger.info(`⏩ Skipping ${video.video_id} (already ingested)`);
      return;
    }

    // 1) Fetch raw transcript segments from YouTube
    let segments;
    try {
      segments = await YoutubeTranscript.fetchTranscript(video.video_id);
    } catch (err) {
      logger.error(
        `❌ Failed to fetch transcript for ${video.video_id}: ${err.message}`
      );
      return;
    }

    // 2) Format: punctuate → clean
    const rawText = segments.map((s) => s.text).join(" ");
    const formatted = await formatTranscript(rawText);
    const cleaned = cleanTranscript(formatted);
    // 3) Split into sentences and align to segments to get start/end times
    const sentenceList = splitIntoSentences(cleaned);
    const aligned = alignSentencesToSegments(sentenceList, segments);
    await client.query(
      `
        INSERT INTO videos (video_id, video_title, published_at, formatted_transcript)
        VALUES ($1, $2, $3, $4)
      `,
      [video.video_id, video.title, video.published_at, cleaned]
    );

    // 4) Persist raw segments for reference/analytics
    for (const s of segments) {
      const startSeconds = parseFloat((s.offset / 1000).toFixed(3));
      await client.query(
        `
                INSERT INTO transcript_segments (video_id, start_time, text_segment)
                VALUES ($1, $2, $3)
              `,
        [video.video_id, startSeconds, s.text]
      );
    }
    // 5) Persist aligned sentences
    for (const s of aligned) {
      await client.query(
        `
        INSERT INTO transcript_sentences (video_id, sentence_index, start_time, end_time, cleaned_text)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          video.video_id,
          s.sentence_index,
          s.start_time,
          s.end_time,
          s.cleaned_text,
        ]
      );
    }
    try {
      // 6) Index documents in Meilisearch (video-level + sentence-level)
      await indexTranscript(video.video_id, video.title, cleaned);
      const docs = aligned.map((s) => ({
        id: `${video.video_id}:${s.sentence_index}`,
        video_id: video.video_id,
        title: video.title,
        text: s.cleaned_text,
        start: s.start_time,
        end: s.end_time,
        published_at: video.published_at,
      }));
      await indexSentenceDocuments(docs);
      logger.info(
        `📨 Indexing to Meilisearch: ${video.video_id} (+${docs.length} sentences)`
      );
    } catch (err) {
      logger.error(`❌ Failed to index to Meilisearch: ${video.video_id}`, {
        error: err.message,
      });
    }
    logger.info(`✅ Ingested ${video.title}`);
  } finally {
    client.release();
  }
}
