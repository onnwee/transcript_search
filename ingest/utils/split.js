import { logger } from './logger.js';

export function splitIntoChunks(text, maxLength = 1000) {
    const chunks = [];
    let current = '';

    for (const piece of text.split(/(?<=[.?!])\s+/)) {
        if ((current + piece).length > maxLength) {
            chunks.push(current.trim());
            current = piece;
        } else {
            current += ' ' + piece;
        }
    }

    if (current) chunks.push(current.trim());

    logger.info(`🔪 Split transcript into ${chunks.length} chunks`);
    return chunks;
}
