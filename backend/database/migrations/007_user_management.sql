-- ============================================================
-- Phase: Admin User Management — status + last_login
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_status_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_status_check
      CHECK (status IN ('active', 'inactive', 'blocked'));
  END IF;
END $$;

UPDATE users SET status = 'active' WHERE status IS NULL OR status = '';

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users (last_login DESC NULLS LAST);
