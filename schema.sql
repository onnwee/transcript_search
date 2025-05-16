-- === Videos Table ===
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    video_id TEXT UNIQUE NOT NULL,
    video_title TEXT NOT NULL,
    published_at TIMESTAMP,
    formatted_transcript TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- === Transcript Segments Table ===
CREATE TABLE IF NOT EXISTS transcript_segments (
    id SERIAL PRIMARY KEY,
    video_id TEXT NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
    start_time NUMERIC NOT NULL,
    text_segment TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_video_id ON videos(video_id);
CREATE INDEX IF NOT EXISTS idx_segments_video_id ON transcript_segments(video_id);


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