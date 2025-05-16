import 'dotenv/config';
import { Pool } from 'pg';
import { YoutubeTranscript } from 'youtube-transcript';
import { formatTranscript } from './format.js';
import { indexTranscript } from './meili.js';
import { logger } from './utils/logger.js';

const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL ||
        'postgres://postgres:postgres@transcript_pg:5432/transcripts',
});

export async function ingestVideo(video) {
    const client = await pool.connect();

    try {
        const { rows } = await client.query(
            'SELECT 1 FROM videos WHERE video_id = $1',
            [video.video_id]
        );

        if (rows.length > 0) {
            logger.info(`⏩ Skipping ${video.video_id} (already ingested)`);
            return;
        }

        let segments;
        try {
            segments = await YoutubeTranscript.fetchTranscript(video.video_id);
        } catch (err) {
            logger.error(
                `❌ Failed to fetch transcript for ${video.video_id}`,
                {
                    error: err.message,
                }
            );
            return;
        }

        const rawText = segments.map((s) => s.text).join(' ');
        const formatted = await formatTranscript(rawText);

        await client.query(
            `
      INSERT INTO videos (video_id, video_title, published_at, formatted_transcript)
      VALUES ($1, $2, $3, $4)
    `,
            [video.video_id, video.title, video.published_at, formatted]
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

        await indexTranscript(video.video_id, video.title, formatted);
        logger.info(`✅ Ingested ${video.title}`);
    } finally {
        client.release();
    }
}
