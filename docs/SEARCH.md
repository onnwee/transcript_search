# Search and Relevance

## Indexes

- transcripts

  - searchable: title, transcript
  - displayed: title, transcript
  - Use for broad, video-level search/navigation.

- transcript_sentences
  - searchable: text, title
  - displayed: id, video_id, title, text, start, end, published_at
  - filterable: video_id, published_at
  - pagination.maxTotalHits: 2000

## Settings

- Stop words: common English terms to reduce noise.
- Synonyms: acronyms and variants (AI, LLM, politics/current events, Twitch streamers).
- Typo tolerance enabled on transcripts; segment index uses defaults.

## Queries

- Backend `/api/search` wraps Meili `/indexes/{index}/search` with highlight tags `<mark>...</mark>`.
- Supports filters: `video_id = "..."`.

## Frontend

- Uses InstantSearch client via `instant-meilisearch`.
- Grouped results show multiple snippets per video, sorted by start time.
- Highlights are rendered via Meili `_formatted.text`.

## Tuning

- Adjust `synonyms` and `stopWords` in `ingest/utils/meili.js`.
- Re-run `ingest/utils/setupMeili.js` or `ingest/setupMeiliSegments.js` to apply.
