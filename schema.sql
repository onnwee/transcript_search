-- === Videos Table ===
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    video_id TEXT UNIQUE NOT NULL,
    video_title TEXT NOT NULL,
    published_at TIMESTAMP,
    formatted_transcript TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add missing column when applying schema to existing DB
ALTER TABLE videos
    ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMP DEFAULT NOW();

-- === Transcript Segments Table ===
CREATE TABLE IF NOT EXISTS transcript_segments (
    id SERIAL PRIMARY KEY,
    video_id TEXT NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
    start_time NUMERIC NOT NULL,
    text_segment TEXT NOT NULL,
    timestamp TEXT GENERATED ALWAYS AS (
        CASE
            WHEN start_time >= 3600 THEN
                LPAD(FLOOR(start_time / 3600)::TEXT, 1, '0') || ':' ||
                LPAD(FLOOR((start_time % 3600) / 60)::TEXT, 2, '0') || ':' ||
                LPAD(FLOOR(start_time % 60)::TEXT, 2, '0')
            ELSE
                LPAD(FLOOR(start_time / 60)::TEXT, 1, '0') || ':' ||
                LPAD(FLOOR(start_time % 60)::TEXT, 2, '0')
        END
    ) STORED
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_video_id ON videos(video_id);
CREATE INDEX IF NOT EXISTS idx_segments_video_id ON transcript_segments(video_id);
CREATE INDEX IF NOT EXISTS idx_segments_start_time ON transcript_segments(start_time);

-- === Transcript Sentences Table ===
CREATE TABLE IF NOT EXISTS transcript_sentences (
    id SERIAL PRIMARY KEY,
    video_id TEXT NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
    sentence_index INTEGER NOT NULL,
    start_time NUMERIC NOT NULL,
    end_time NUMERIC NOT NULL,
    cleaned_text TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sentences_vid_idx ON transcript_sentences(video_id, sentence_index);
CREATE INDEX IF NOT EXISTS idx_sentences_vid_start ON transcript_sentences(video_id, start_time);


-- === Visitor Sessions Table ===
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- required for gen_random_uuid()

CREATE TABLE IF NOT EXISTS visitor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- === Page Views Table ===
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    page_path TEXT,
    event_type TEXT DEFAULT 'page_view',
    metadata JSONB,
    occurred_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_event_type ON page_views(event_type);