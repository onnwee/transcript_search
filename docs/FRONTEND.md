# Frontend (React + Vite)

## Pages

- Home
  - InstantSearch UI against `transcript_sentences`
  - `GroupedResults` infinite scroll groups hits by video
  - Stats, HitsPerPage, Pagination (optional)
- TranscriptViewer
  - Accepts `?t=<seconds>` to deep-link
  - Embeds YouTube at start time
  - Fetches sentence window via `/api/video/:id/segments?from&to`
  - Highlights current sentence, prev/next, copy link
- SystemMonitor
  - Pings API endpoints and lists docker containers
  - WebSocket live logs via `/api/docker-logs`

## Components

- GroupedResults: groups `useInfiniteHits` into per-video cards
- ResultsList: flat list (legacy)
- SearchBox: wrapper for InstantSearch SearchBox
- DockerLogStream: WebSocket viewer with ANSI to HTML

## Environment

- VITE_MEILISEARCH_HOST, VITE_MEILISEARCH_API_KEY
- VITE_MEILI_SEGMENT_INDEX (default transcript_sentences)
- VITE_API_URL (for backend)
- VITE_WS_URL (for docker logs WebSocket)

## Styling

- Tailwind CSS; see `tailwind.config.js` and `index.css`
