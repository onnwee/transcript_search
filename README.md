# 🎙️ Transcript Search

A full-stack application for ingesting, formatting, and searching YouTube video transcripts. Built for speed, usability, and extensibility.

## 📦 Project Structure

- ⛔ Commented out for now

## 🚀 Deploying with Docker + Caddy

This repo includes a `docker-compose.yml` that exposes:

- Postgres (`transcript_pg`)
- Meilisearch (`meilisearch`)
- Backend API (`backend`) on 3000
- Punctuator (`punctuator`) on 8000
- Ingest worker (`ingest`)

For reverse proxy via Caddy on an external Docker network named `web`, the compose file is already configured to join the `web` network for `backend` and `meilisearch`.

1. Create the external network once on your host:

docker network create web

2. Copy env template and adjust credentials:

cp .env.example .env

# Edit .env (a comprehensive .env.example is provided) and set:

# - MEILI_MASTER_KEY (Meilisearch server master key)

# - MEILISEARCH_API_KEY (client key; reuse master in dev is OK)

# - YOUTUBE_CHANNEL_ID and YOUTUBE_API_KEY (for ingest)

# - DATABASE_URL if needed

3. Start services and initialize:

docker-compose up -d
make schema
make meili-setup

4. (Optional) Run ingest tasks:

make ingest-all

### Example Caddyfile (snippet)

Note: Adjust domain names/ports to match your server.

```
api.example.com {
  reverse_proxy backend:3000
}

search.example.com {
  reverse_proxy meilisearch:7700
}
```

Ensure Caddy is connected to the same `web` network: run Caddy in Docker with `--network web` or add it to that network.

## 🔧 Environment Variables

See `.env.example` for a complete template. Key values:

- DATABASE_URL: postgres connection string
- MEILISEARCH_HOST / MEILI_HOST: Meili endpoint (service name inside compose)
- MEILISEARCH_API_KEY / MEILI_API_KEY: strong master key
- MEILI_SEGMENT_INDEX / VITE_MEILI_SEGMENT_INDEX: index for sentence snippets (default `transcript_sentences`)
- PUNCTUATOR_URL: http://punctuator:8000 (inside compose)
- VITE_API_URL / VITE_MEILISEARCH_HOST / VITE_MEILISEARCH_API_KEY for frontend dev

Additional ingest tuning envs:

- INGEST_CONCURRENCY: parallel videos to process during backfill (default 2)
- YT_MIN_DELAY_MS: minimum delay between YouTube transcript fetches in ms (default 500)
- YT_CAPTCHA_BACKOFF_MS: cooldown when CAPTCHA/429 is detected (default 60000)
- INGEST_RETRY_MIN_TIMEOUT_MS: base delay for per-video retry backoff (default 2000)
- INGEST_RETRY_FACTOR: exponential factor for retries (default 2)

### Handling YouTube rate limiting

The ingest includes a global limiter that spaces out transcript fetch requests and pauses when CAPTCHA/429 responses are detected. If you hit throttling:

- Reduce `INGEST_CONCURRENCY` to 1–2 for bulk backfills
- Increase `YT_MIN_DELAY_MS` (e.g., 1000–2000)
- Increase retry backoff via `INGEST_RETRY_MIN_TIMEOUT_MS` and `INGEST_RETRY_FACTOR`

## 🧪 Tests (ingest utils)

From the `ingest` folder:

npx vitest run

## 📚 Documentation

Start here to understand the system end-to-end:

- docs/ARCHITECTURE.md — high-level overview of services and data flow
- docs/PIPELINE.md — ingest pipeline (YouTube → clean → punctuate → align → DB → Meili)
- docs/API.md — backend API routes and response shapes
- docs/DATABASE.md — schema, keys, and indexes
- docs/SEARCH.md — Meilisearch indexes, settings, synonyms, and relevance
- docs/FRONTEND.md — UI, pages, components, and search integration
- docs/DEPLOYMENT.md — deployment details, envs, and reverse proxy
- docs/OPERATIONS.md — day-2 ops: setup, backfills, logs, resets
- docs/TROUBLESHOOTING.md — common issues and fixes
