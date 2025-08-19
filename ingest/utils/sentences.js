import { logger } from "./logger.js";

// Basic sentence splitter using punctuation boundaries and common abbreviations heuristic
/**
 * Split cleaned transcript text into sentences.
 * Protects common abbreviations to avoid over-splitting.
 */
export function splitIntoSentences(text) {
  if (!text) return [];
  // Protect common abbreviations from splitting (approximate)
  const placeholders = new Map();
  const protect = (abbr) => {
    const token = abbr.replaceAll(".", "__DOT__");
    placeholders.set(token, abbr);
    return token;
  };
  const protectedText = text
    .replace(/\b(e\.g\.|i\.e\.|Mr\.|Mrs\.|Dr\.|Prof\.|Sr\.|Jr\.|vs\.)/g, (m) =>
      protect(m)
    )
    .replace(/\b(U\.S\.|U\.K\.|E\.U\.)/g, (m) => protect(m));

  const raw = protectedText
    .split(/(?<=[.!?])\s+|(?<=[.!?])$/)
    .map((s) => s.trim())
    .filter(Boolean);

  const restored = raw.map((s) => {
    let out = s;
    for (const [token, abbr] of placeholders.entries()) {
      out = out.replaceAll(token, abbr);
    }
    return out;
  });

  return restored;
}

function normalizeForAlign(s) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, "") // drop punctuation
    .replace(/\s+/g, " ") // collapse spaces
    .trim();
}

// Align sentences to original segments by normalized char length accumulation.
// segments: [{ text, offset (ms), duration (ms) }]
// Rationale: YouTube transcripts provide coarse-grained time slices; we approximate
// sentence timing by consuming segment "length" until we cover a sentence's length.
export function alignSentencesToSegments(sentences, segments, opts = {}) {
  const tolerance = opts.tolerance ?? 0.25; // 25% len diff tolerance

  // Precompute segment times and normalized lengths
  const segs = segments.map((s, idx) => {
    const start = (s.offset || 0) / 1000;
    const end = s.duration ? (s.offset + s.duration) / 1000 : undefined;
    const norm = normalizeForAlign(s.text || "");
    return {
      idx,
      start,
      end, // may be undefined; we'll compute from next segment if needed
      norm,
      len: norm.length,
    };
  });

  // Fill missing end using next.start or +3s fallback
  for (let i = 0; i < segs.length; i++) {
    if (segs[i].end == null) {
      segs[i].end = i + 1 < segs.length ? segs[i + 1].start : segs[i].start + 3;
    }
  }

  const normalizedSentences = sentences.map((t) => ({
    text: t,
    norm: normalizeForAlign(t),
    len: normalizeForAlign(t).length,
  }));

  const out = [];
  let segPtr = 0;

  for (let i = 0; i < normalizedSentences.length; i++) {
    const s = normalizedSentences[i];
    // Skip empty sentences after normalization
    if (!s.len) {
      // Use previous end as start to keep monotonic timeline
      const prev = out[out.length - 1];
      const start = prev ? prev.end_time : segs[segPtr]?.start ?? 0;
      out.push({
        sentence_index: i,
        start_time: start,
        end_time: start,
        cleaned_text: sentences[i],
      });
      continue;
    }

    let consumedLen = 0;
    const startSeg = segPtr;
    let endSeg = segPtr;

    while (endSeg < segs.length && consumedLen < s.len * (1 - tolerance)) {
      consumedLen += segs[endSeg].len + 1; // +1 for space between segments
      endSeg++;
    }

    if (endSeg === segPtr) {
      // Ensure at least one segment
      endSeg = Math.min(segPtr + 1, segs.length);
    }

    const start = segs[startSeg]?.start ?? out[out.length - 1]?.end_time ?? 0;
    const end = segs[Math.max(endSeg - 1, startSeg)]?.end ?? start;

    out.push({
      sentence_index: i,
      start_time: Number(start.toFixed(3)),
      end_time: Number(end.toFixed(3)),
      cleaned_text: sentences[i],
    });

    segPtr = endSeg;
    if (segPtr >= segs.length) segPtr = segs.length - 1; // clamp
  }

  // Ensure monotonic non-decreasing times
  for (let i = 1; i < out.length; i++) {
    if (out[i].start_time < out[i - 1].end_time) {
      out[i].start_time = out[i - 1].end_time;
      if (out[i].end_time < out[i].start_time)
        out[i].end_time = out[i].start_time;
    }
  }

  logger.info(
    `🧩 Aligned ${out.length} sentences to ${segments.length} segments`
  );
  return out;
}
