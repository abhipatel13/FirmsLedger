-- Migration 005: Extended agency profile fields
-- Run in Supabase SQL Editor

ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS phone            TEXT,
  ADD COLUMN IF NOT EXISTS hourly_rate      TEXT,
  ADD COLUMN IF NOT EXISTS address          TEXT,
  ADD COLUMN IF NOT EXISTS tagline          TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url     TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url      TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url     TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url    TEXT,
  ADD COLUMN IF NOT EXISTS service_focus    JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS industry_focus   JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS client_focus     JSONB DEFAULT '{}';

-- service_focus format:  [{"service": "SEO Services", "percentage": 50}, ...]
-- industry_focus format: [{"industry": "Automotive", "percentage": 10}, ...]
-- client_focus format:   {"small_business": 65, "medium_business": 30, "large_business": 5}
