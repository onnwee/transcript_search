# Operations (Day 2)

## Health

- Backend: GET /api/health should return 200 OK
- Meili: GET /health (7700) should return 200 OK
- Punctuator: GET /health (8000) should return 200 OK

## Logs

- Backend container logs for API issues
- Punctuator logs for model download and requests
- Meili logs if settings/indexing fail
- SystemMonitor page includes Docker container list and live logs

## Common tasks

- Setup Meili indexes/settings
  - `node ingest/utils/setupMeili.js`
  - or `node ingest/setupMeiliSegments.js` for sentence index only
- Backfill sentences
  - `node ingest/backfill_sentences.js [video_id ...]`
- Reindex sentence documents (incremental)
  - Re-run `ingest/utils/ingest.js` for specific videos

## Troubleshooting quick checks

- Confirm `.env` values in containers (`docker exec env`)
- Check network connectivity between services (hostnames from compose)
- Verify Meili API key matches across backend/ingest/frontend
