-- Phase 5: visitor analytics extensions
ALTER TABLE visitor_logs ADD COLUMN IF NOT EXISTS referrer VARCHAR(500);
