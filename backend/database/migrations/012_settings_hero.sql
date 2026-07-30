-- ============================================================
-- Migration: Add Hero Greeting and Avatar to Settings
-- ============================================================

ALTER TABLE settings
ADD COLUMN IF NOT EXISTS hero_greeting VARCHAR(120),
ADD COLUMN IF NOT EXISTS hero_avatar VARCHAR(500);
