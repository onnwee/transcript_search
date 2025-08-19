# Architecture Overview

This document explains the system at a high level so a new contributor can become productive quickly.

## Services

- Ingest (Node.js)
  - Fetches YouTube transcripts and metadata
  - Cleans and punctuates text in resilient batches
  - Splits into sentences, aligns to YouTube timecodes
  - Stores in Postgres (videos, transcript_segments, transcript_sentences)
  - Indexes videos and sentence snippets in Meilisearch
- Backend API (Go + Echo)
  - Simple HTTP API for search, video details, and sentence windows
  - Proxies search to Meilisearch (configured for sentence index)
  - System endpoints for Docker status and logs (optional)
- Frontend (React + Vite)
  - Search UI powered by InstantSearch (Meilisearch)
  - Grouped results by video with highlighted snippets
  - Transcript viewer with YouTube embed and sentence-level navigation
- Punctuator (Python + Flask)
  - Provides /health and /punctuate; uses deepmultilingualpunctuation model
  - Stateless; safe to scale horizontally
- Meilisearch
  - Full-text search engine, stores two indexes:
    - transcripts: one document per video
    - transcript_sentences: one document per sentence with time bounds
- Postgres
  - Source of truth: video metadata, raw segments, and aligned sentences

## Data Flow

YouTube → ingest (Node) → clean & punctuate → sentence split → alignment →
Postgres (videos, segments, sentences) → Meili (video + sentence indexes) →
Backend API → Frontend UI.

## Indexes

- transcripts (id, title, transcript)
- transcript_sentences (id=video_id:sentence_index, video_id, title, text, start, end, published_at)

## Environments

- docker-compose orchestrates all services
- External network `web` connects to Caddy (reverse proxy)
- `.env` controls DB, Meili, Punctuator, and frontend vars
