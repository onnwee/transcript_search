import "dotenv/config";
import { Pool } from "pg";
import {
  splitIntoSentences,
  alignSentencesToSegments,
} from "./utils/sentences.js";
import { cleanTranscript } from "./utils/clean.js";
import { logger } from "./utils/logger.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function backfillForVideo(client, video_id) {
  const { rows: vrows } = await client.query(
    "SELECT formatted_transcript FROM videos WHERE video_id = $1",
    [video_id]
  );
  if (vrows.length === 0) {
    logger.warn(`Video not found: ${video_id}`);
    return;
  }
  const { rows: segs } = await client.query(
    "SELECT start_time, text_segment FROM transcript_segments WHERE video_id = $1 ORDER BY start_time ASC",
    [video_id]
  );
  const segments = segs.map((r) => ({
    text: r.text_segment,
    offset: Math.round(Number(r.start_time) * 1000),
    duration: 0,
  }));
  const cleaned = cleanTranscript(vrows[0].formatted_transcript || "");
  const sentences = splitIntoSentences(cleaned);
  const aligned = alignSentencesToSegments(sentences, segments);

  await client.query("BEGIN");
  try {
    await client.query("DELETE FROM transcript_sentences WHERE video_id = $1", [
      video_id,
    ]);
    for (const s of aligned) {
      await client.query(
        `INSERT INTO transcript_sentences (video_id, sentence_index, start_time, end_time, cleaned_text)
                 VALUES ($1, $2, $3, $4, $5)`,
        [video_id, s.sentence_index, s.start_time, s.end_time, s.cleaned_text]
      );
    }
    await client.query("COMMIT");
    logger.info(`Backfilled ${aligned.length} sentences for ${video_id}`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
}

async function main() {
  const client = await pool.connect();
  try {
    const ids = process.argv.slice(2);
    let videos = ids;
    if (videos.length === 0) {
      const { rows } = await client.query(
        "SELECT video_id FROM videos ORDER BY created_at DESC"
      );
      videos = rows.map((r) => r.video_id);
    }
    for (const vid of videos) {
      await backfillForVideo(client, vid);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
