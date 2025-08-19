# Ingest Pipeline

This explains the end-to-end ingest path and the rationale for each step.

## Steps

1. Fetch transcript and metadata

- `ingest/utils/youtube.js` uses YouTube Data API to list videos.
- `youtube-transcript` fetches the raw transcript segments per video.

2. Clean text

- `ingest/utils/clean.js` decodes HTML entities, normalizes whitespace, tames filler words, removes tags/noise, and normalizes punctuation & spacing.
- Idempotent: multiple runs produce stable output.

3. Chunk and punctuate

- `ingest/utils/split.js` splits text by size (word boundary), robust to unpunctuated input.
- `ingest/utils/punctuate.js` calls Punctuator service with concurrency, retries, timeouts. Falls back to original text when errors persist.

4. Sentence segmentation

- `ingest/utils/sentences.js` splits cleaned text into sentences, protecting common abbreviations.

5. Alignment to source segments

- `alignSentencesToSegments` approximates sentence time bounds via normalized character-length matching across segments.
- Ensures monotonic non-decreasing start/end times.

6. Persist to Postgres

- `videos`: one row per video; stores `formatted_transcript`
- `transcript_segments`: original per-segment text with `start_time`
- `transcript_sentences`: aligned sentences with `start_time`/`end_time`

7. Index to Meilisearch

- `transcripts` index: video-level search
- `transcript_sentences` index: sentence-level search with highlights, filters

## Scripts

- `ingest/ingest_all.js` — orchestrates ingest across all videos (concurrency, retries)
- `ingest/utils/ingest.js` — single video ingest implementation
- `ingest/utils/setupMeili.js` — boots Meili settings for both indexes
- `ingest/setupMeiliSegments.js` — ensures/configures sentence index only
- `ingest/backfill_sentences.js` — rebuilds sentences from stored transcripts + segments

## Configuration

- `PUNCTUATOR_URL`, `PUNCTUATOR_CONCURRENCY`, `PUNCTUATOR_TIMEOUT_MS`
- `PUNCTUATE_MAX_CHARS`, `PUNCTUATE_SOFT_MAX`
- `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `MEILI_SEGMENT_INDEX`
- `DATABASE_URL`, `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`

## Testing

- Ingest utils have vitest tests (see `ingest/__tests__`).
- Validate by running: `npx vitest run` in the `ingest` folder.
