# ✅ Transcript Search — Project TODO

What’s done, what’s next, and what’s coming soon. Clean. Organized. Focused. ✨

---

## 🗂️ Project Status

- 🏗️ **Mono-repo: `transcript_search/`**

  - `frontend/` — React + Vite UI
  - `backend/` — Go API
  - `ingest/` — Node.js transcript fetcher/formatter/indexer
  - `schema.sql` — PostgreSQL schema
  - `.env` config + `.gitignore`
  - AGPLv3 license
  - Git history cleaned & repo structure standardized

---

## 🧩 Ingest Layer (Node.js)

### ✅ Completed

- [x] `ingest_all.js` — fetch + punctuate + clean + index entire channel
- [x] `ingest_new.js` — ingest only new videos
- [x] Dockerized `punctuator` using DeepMultilingualPunctuation
- [ ] Transcript cleaner
- [x] Retry handling on transcript fetch
- [x] Logging for ingest pipeline
- [x] Meilisearch indexing with fallback logging

### 🔜 Next

- [ ] Add logging/output for skipped videos
- [ ] Add retry handling for Meili & punctuator failures
- [ ] Add CLI flags: ingest single video by ID (debug mode)
- [ ] Add `.env` validation (warn on missing API keys, etc.)
- [ ] Add “clean-only” dev script for transcript formatting

---

## 🗄️ Database (PostgreSQL)

### ✅ Completed

- [x] `videos` table
- [x] `transcript_segments` table
- [x] `visitor_sessions` + `page_views` (early analytics support)

### 🔜 Next

- [ ] Add `/segment/:id/context` API endpoint (optional)
- [ ] Add `ingested_at` timestamp to `videos`
- [ ] Consider storing `cleaned_segment_text` per chunk for Meili context

---

## ⚙️ Backend (Go API)

### ✅ Completed

- [x] `/api/ping` — health check
- [x] `/api/video/:id` — full transcript
- [x] `/api/search?q=` — Meilisearch wrapper
- [x] Meilisearch `Bearer` auth + index name from `.env`

### 🔜 Next

- [ ] `/api/segment/:id/context` — show search hit in full context
- [ ] Add CORS headers for dev frontend
- [ ] Add logging middleware
- [ ] Add pagination to `/api/search`
- [ ] Return highlighted matches from Meili (bonus polish)

---

## 🌐 Frontend (React + Vite)

### ✅ Completed

- [x] `npx tailwindcss init -p` done ✅
- [x] Tailwind + Vite set up
- [x] `Home.jsx` — search with Meilisearch/InstantSearch
- [x] `TranscriptViewer.jsx` — full transcript by video ID
- [x] `react-router-dom` routing

### 🔜 Next

- [ ] Move `TranscriptViewer.jsx` to `/pages/` ✅
- [ ] Add loading skeletons for all routes
- [ ] Clickable timestamps → YouTube link (`?t=seconds`)
- [ ] Highlight search terms in transcript
- [ ] Add dark/light mode toggle
- [ ] Add error handling for failed loads
- [ ] Add responsive mobile layout improvements

---

## 🧠 Analytics (Optional Enhancement)

### Ideas for Later

- [ ] Track page views via `/api/track`
- [ ] Anonymous session IDs (cookie-based UUID)
- [ ] Track search terms (optional toggle in UI)
- [ ] Admin-only dashboard: most searched, most viewed videos
- [ ] Export search stats to CSV (for offline analysis)

---

## 🧪 Testing & DevOps

### Planned

- [ ] Add `docker-compose.yml` with all services ✅ (mostly done)
- [ ] Add basic unit tests for Go API (search, health)
- [ ] Add `test-db` Makefile target for quick DB sanity check ✅
- [ ] GitHub Actions CI (lint + test)
- [ ] Add test mode to ingest scripts
- [ ] Healthchecks for punctuator, postgres, meili (backend)

---

## 🤖 AI Roadmap

### ✨ AI-Powered Enhancements (future opt-in)

- [ ] AI summarization of full transcript per video
- [ ] Segment classification (debate, chat, monologue, etc.)
- [ ] Auto-topic tagging via embedding clustering
- [ ] Local LLM search: phrase-to-timestamp via sentence embedding (Deepseek / OpenAI / Ollama)
- [ ] AI-augmented highlights: summarize most discussed topic in stream

---

## 🧭 Stretch Features

These are longer-term, but worth considering:

- [ ] Speaker labels (if detected/available from structured data)
- [ ] Audio/video snippets (timestamp → MP3/MP4 clip for sharing)
- [ ] Upload-your-own-video → process pipeline
- [ ] OAuth login + saved search history
- [ ] User-submitted transcript corrections

---

## 🏁 Final Notes

Drink water, Smoke weed, commit often, test before you push.

> “Fuck it. I'm sayin' it.”
> — Hasanabi 8/21
