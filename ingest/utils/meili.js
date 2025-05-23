import 'dotenv/config';
import axios from 'axios';
import { logger } from './logger.js';

export async function indexTranscript(video_id, title, transcript) {
    const index = 'transcripts';
    console.log(
        '📡 Indexing URL:',
        `${process.env.MEILISEARCH_HOST}/indexes/${index}/documents`
    );
    console.log('🔑 API Key:', process.env.MEILISEARCH_API_KEY);
    try {
        const res = await axios.post(
            `${process.env.MEILISEARCH_HOST}/indexes/${index}/documents`,
            [{ id: video_id, title, transcript }],
            {
                headers: {
                    Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        logger.info(`📨 Meili indexing task queued for ${video_id}`, res.data);
        return res.data;
    } catch (err) {
        logger.error(`❌ Meili indexing failed for ${video_id}:`, err.message);
        if (err.response?.data) {
            logger.error('📄 Meili response:', err.response.data);
        }
        throw err;
    }
}

export async function configureIndex() {
    const index = 'transcripts';
    await axios.post(
        `${process.env.MEILISEARCH_HOST}/indexes/${index}/settings`,
        {
            searchableAttributes: ['title', 'transcript'],
            displayedAttributes: ['title', 'transcript'],
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );
}
