import he from "he";

/**
 * Normalize and sanitize transcript text.
 * - Decode HTML entities
 * - Normalize whitespace and punctuation
 * - Replace noisy bracket annotations with canonical tags
 * - Idempotent: calling twice is safe
 */
export function cleanTranscript(text) {
  if (!text) return "";

  // 1. Decode HTML entities (twice in case of double encoding)
  text = he.decode(he.decode(text));

  // 2. Normalize whitespace and remove excessive line breaks
  text = text
    .replace(/\r\n|\r|\n/g, " ") // collapse all newlines into spaces
    .replace(/\s{2,}/g, " ") // collapse multiple spaces
    .trim();

  // 3. Collapse filler words and repeated interjections
  const repeatedWordRegex = /\b(uh|um|er|ah|like|you know)(\s+\1){1,}/gi;
  text = text.replace(repeatedWordRegex, "$1");

  // 4. Remove or replace tags and common noise — but preserve [__]
  text = text
    .replace(
      /\[[^\]]*?(music|applause|laugh|laughter|crowd)[^\]]*?\]/gi,
      "[Noise]"
    )
    .replace(/\[[^\]]*?unintelligible[^\]]*?\]/gi, "[Unintelligible]")
    .replace(/\[(\/?)(?!__|Noise|Unintelligible)[a-zA-Z]+\]/g, "") // remove bracket tags except [__], [Noise], [Unintelligible]
    .replace(/<[^>]+>/g, "") // remove HTML tags
    .replace(/&nbsp;/g, " ");

  // 5. Fix repeated punctuation and artifacts
  text = text
    .replace(/\.{3,}/g, "...") // normalize ellipses
    .replace(/([?!]){2,}/g, "$1") // reduce !!! or ??? to single
    .replace(/--+/g, "-") // normalize dashes
    .replace(/["“”]+/g, '"') // normalize quotes
    .replace(/‘|’/g, "'"); // normalize apostrophes

  // 6. Clean up spacing around punctuation
  text = text
    .replace(/\s+([.,?!;:])/g, "$1") // no space before punctuation
    .replace(/([.,?!;:])(?!\s|$)/g, "$1 ") // ensure space after punctuation unless end
    .replace(/\s{2,}/g, " "); // clean extra spaces again

  return text;
}
