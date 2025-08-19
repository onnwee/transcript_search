# Deployment

## Prerequisites

- Docker + Docker Compose
- Optional: Caddy reverse proxy on external docker network `web`

## Steps

1. Create external network (once)

   docker network create web

2. Copy env template and edit secrets

   cp .env.example .env

3. Start services

   docker-compose up -d

4. Initialize database and Meilisearch

   make schema
   make meili-setup

5. Ingest content (optional)

   make ingest-all

## Caddy reverse proxy

Example Caddyfile snippets:

```
api.example.com {
  reverse_proxy backend:3000
}

search.example.com {
  reverse_proxy meilisearch:7700
}
```

Ensure Caddy joins the `web` network (either run container with `--network web` or attach it).

## Environment

- See `.env.example` for all keys (DB, Meili, Punctuator, Frontend)

## Backfills & Resets

- Backfill sentences: `node ingest/backfill_sentences.js [video_id ...]`
- Reset local DB tables: `psql -f reset.sql` (destructive)
