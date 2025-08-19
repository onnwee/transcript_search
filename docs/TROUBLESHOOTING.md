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

## YouTube CAPTCHA / 429 Too Many Requests

Symptoms:

- Errors like "YouTube is receiving too many requests and is asking for a captcha" or HTTP 429.

Mitigations:

- Lower `INGEST_CONCURRENCY` to 1–2
- Increase `YT_MIN_DELAY_MS` (try 1000–2000)
- Increase `INGEST_RETRY_MIN_TIMEOUT_MS` and/or `INGEST_RETRY_FACTOR`
- Wait and retry later; IP reputation can matter (avoid running many scrapers from the same IP)
