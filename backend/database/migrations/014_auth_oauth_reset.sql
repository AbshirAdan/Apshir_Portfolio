-- ============================================================
-- Phase: Professional Authentication Upgrade (OAuth & Resets)
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

-- Ensure passwords are only strictly required for local accounts
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- We still want passwords to be required if provider is local
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_local_password_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_local_password_check
      CHECK (provider != 'local' OR password IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users (provider, provider_id);
