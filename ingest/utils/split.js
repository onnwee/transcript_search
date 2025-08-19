import { logger } from "./logger.js";

// Size-based chunking by word boundary. Works even on unpunctuated input.
// Signature remains compatible with previous usage: (text, maxLength?: number)
// Optionally accept an options object: { maxChars, softMaxChars }
/**
 * Size-based chunking by word boundary. Robust to unpunctuated input.
 * @param {string} text
 * @param {number|{maxChars:number, softMaxChars:number}} optionsOrMax
 * @returns {string[]}
 */
export function splitIntoChunks(text, optionsOrMax = 1000) {
  if (!text) return [];

  const isNumber = typeof optionsOrMax === "number";
  const maxChars = isNumber ? optionsOrMax : optionsOrMax?.maxChars ?? 1000;
  const softMaxChars = isNumber
    ? Math.max(800, Math.floor(maxChars * 0.8))
    : optionsOrMax?.softMaxChars ?? Math.max(800, Math.floor(maxChars * 0.8));

  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  let current = "";

  const pushCurrent = () => {
    const trimmed = current.trim();
    if (trimmed.length) chunks.push(trimmed);
    current = "";
  };

  for (const word of words) {
    // Extremely long tokens: hard-split to avoid runaway
    if (word.length > maxChars) {
      // Flush current before splitting the long token
      if (current.length >= softMaxChars) pushCurrent();
      for (let i = 0; i < word.length; i += maxChars) {
        chunks.push(word.slice(i, i + maxChars));
      }
      continue;
    }

    const candidate = current ? current + " " + word : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      // If we've reached softMaxChars, prefer to cut here
      if (current.length >= softMaxChars) {
        pushCurrent();
        current = word;
      } else {
        // Edge: current is still small but next word pushes over max.
        // Cut anyway to respect hard limit.
        pushCurrent();
        current = word;
      }
    }
  }

  pushCurrent();

  logger.info(
    `🔪 Split transcript into ${chunks.length} chunks (≤ ${maxChars} chars each)`
  );
  return chunks;
}
