-- Disable constraints temporarily
BEGIN;

-- Truncate all relevant tables
TRUNCATE TABLE
  transcript_segments,
  videos,
  visitor_sessions,
  page_views
RESTART IDENTITY CASCADE;

COMMIT;
