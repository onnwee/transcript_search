import { punctuateSentences } from './utils/punctuate.js';
import { splitIntoChunks } from './utils/split.js';

export async function formatTranscript(text) {
    const chunks = splitIntoChunks(text);
    const punctuated = await punctuateSentences(chunks);
    return punctuated.join(' ');
}
