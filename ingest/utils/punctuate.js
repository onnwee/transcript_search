import axios from 'axios';
import { logger } from './logger.js';

export async function punctuateSentences(segments, retries = 3) {
    const results = [];
    const PUNCTUATOR_URL =
        process.env.PUNCTUATOR_URL ||
        (process.env.DOCKER_ENV
            ? 'http://punctuator:8000'
            : 'http://localhost:8000');

    console.log('PUNCTUATOR_URL', PUNCTUATOR_URL);
    for (const text of segments) {
        let success = false;
        let attempt = 0;
        let result = text;

        while (!success && attempt < retries) {
            try {
                const res = await axios.post(`${PUNCTUATOR_URL}/punctuate`, {
                    text,
                });
                result = res.data?.result || text;
                success = true;
            } catch (err) {
                attempt++;
                logger.error('Punctuation attempt failed', {
                    attempt,
                    error: err.message,
                });
            }
        }

        results.push(result);
    }

    logger.info('Punctuation completed', { total: segments.length });
    return results;
}
