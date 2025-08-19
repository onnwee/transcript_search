# Backend API

Base URL: VITE_API_URL (frontend) or http://localhost:3000 (default)

## GET /api/health

- 200 OK: "OK"

## GET /api/search?q=term[&page=&limit=&offset=&video_id=]

- Proxies to Meilisearch segment index
- Returns `{ hits: MeiliHit[], estimatedTotalHits }`
- Each hit: `{ id, video_id, title, text, start, end, _formatted: { title, text } }`

## GET /api/video/:id

- Returns `{ id, title, published, transcript }`
- `published` is RFC3339 string

## GET /api/video/:id/segments?from=&to=

- Returns `{ video_id, sentences: { sentence_index, start_time, end_time, text }[] }`
- When `to` omitted, returns up to 500 sentences from `from`

## GET /api/docker

- Lists docker containers (requires docker.sock mount)

## GET /api/docker-logs (WebSocket)

- Streams colored logs from all running containers

## Notes

- CORS is permissive for dev; lock down origins in production.
- Errors return `{ error: string }` with 4xx/5xx.
