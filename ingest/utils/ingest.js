import 'dotenv/config';

import { Pool } from 'pg';
import { YoutubeTranscript } from 'youtube-transcript';
import { indexTranscript } from '../meili.js';
import { logger } from './utils/logger.js';
import { punctuateSentences } from './utils/punctuate.js';
import { splitIntoChunks } from './utils/split.js';

logger.info(`🔧 Connecting to DB at: ${process.env.DATABASE_URL}`);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function formatTranscript(text) {
    const chunks = splitIntoChunks(text);
    const punctuated = await punctuateSentences(chunks);
    return punctuated.join(' ');
}

export async function ingestVideo(video) {
    const client = await pool.connect();

    try {
        const { rows } = await client.query(
            'SELECT 1 FROM videos WHERE video_id = $1',
            [video.video_id]
        );
        if (rows.length > 0) {
            console.log(`⏩ Skipping ${video.video_id} (already ingested)`);
            return;
        }

        let segments;
        try {
            segments = await YoutubeTranscript.fetchTranscript(video.video_id);
        } catch (err) {
            console.error(
                `❌ Failed to fetch transcript for ${video.video_id}: ${err.message}`
            );
            return;
        }

        const rawText = segments.map((s) => s.text).join(' ');
        const formatted = await formatTranscript(rawText);
        const cleaned = cleanTranscript(formatted);
        await client.query(
            `
        INSERT INTO videos (video_id, video_title, published_at, formatted_transcript)
        VALUES ($1, $2, $3, $4)
      `,
            [video.video_id, video.title, video.published_at, cleaned]
        );

        for (const s of segments) {
            await client.query(
                `
          INSERT INTO transcript_segments (video_id, start_time, text_segment)
          VALUES ($1, $2, $3)
        `,
                [video.video_id, s.offset / 1000, s.text]
            );
        }
        try {
            await indexTranscript(video.video_id, video.title, cleaned);
            logger.info(`📨 Indexing to Meilisearch: ${video.video_id}`);
        } catch (err) {
            logger.error(
                `❌ Failed to index to Meilisearch: ${video.video_id}`,
                {
                    error: err.message,
                }
            );
        }
        console.log(`✅ Ingested ${video.title}`);
    } finally {
        client.release();
    }
}
