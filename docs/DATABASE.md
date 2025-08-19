# Database Schema

See `schema.sql` for the canonical definitions.

## Tables

### videos

- id SERIAL PK
- video_id TEXT UNIQUE (YouTube video id)
- video_title TEXT
- published_at TIMESTAMP
- formatted_transcript TEXT
- created_at TIMESTAMP DEFAULT NOW()
- ingested_at TIMESTAMP DEFAULT NOW()

### transcript_segments

- id SERIAL PK
- video_id TEXT REFERENCES videos(video_id) ON DELETE CASCADE
- start_time NUMERIC (seconds)
- text_segment TEXT
- timestamp (generated column): HH:MM:SS or M:SS

Indexes:

- videos(video_id) UNIQUE
- transcript_segments(video_id)
- transcript_segments(start_time)

### transcript_sentences

- id SERIAL PK
- video_id TEXT REFERENCES videos(video_id) ON DELETE CASCADE
- sentence_index INTEGER
- start_time NUMERIC
- end_time NUMERIC
- cleaned_text TEXT

Indexes:

- (video_id, sentence_index) UNIQUE
- (video_id, start_time)

### visitor_sessions / page_views

- Lightweight analytics tables (optional)

## Migrations

- `schema.sql` is idempotent (CREATE IF NOT EXISTS + ALTER for missing columns)
- `reset.sql` truncates core tables for local testing
