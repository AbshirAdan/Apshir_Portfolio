-- ============================================================
-- Phase: Public Authentication — allow role 'user' + password reset
-- ============================================================

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'editor', 'user'));

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token)
  WHERE reset_token IS NOT NULL;
