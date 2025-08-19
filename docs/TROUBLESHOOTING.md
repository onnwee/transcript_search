# Troubleshooting

## Meili requests failing (401/403)

- Ensure MEILISEARCH_API_KEY is consistent across ingest, backend, frontend.
- Some codepaths use `Authorization: Bearer` vs `X-Meili-API-Key` headers; both are supported, but keep them in sync.

## No highlights shown

- Ensure `/api/search` uses `attributesToHighlight` and highlight tags.
- Confirm frontend renders `_formatted.text` when present.

## Punctuator timeouts

- Increase `PUNCTUATOR_TIMEOUT_MS` and/or reduce `PUNCTUATOR_CONCURRENCY`.
- Service may be cold-starting to download the model; check logs.

## Misaligned sentence timestamps

- Alignment is heuristic; extreme cases may drift.
- Use `backfill_sentences.js` to recompute after cleaner or segmentation changes.

## CORS issues in production

- Tighten/adjust allowed origins in backend `main.go` CORS config.
- Ensure Caddy routes map to the correct internal service names.

## YouTube API limits

- Use `getRecentVideos` during development.
- Backoff / rotate keys if the quota is exhausted.
