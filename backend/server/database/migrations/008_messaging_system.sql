-- ============================================================
-- Phase: Complete Contact & Messaging System
-- ============================================================

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'unread',
  ADD COLUMN IF NOT EXISTS reply TEXT,
  ADD COLUMN IF NOT EXISTS replied_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS user_read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attachment VARCHAR(500);

-- Backfill status from legacy is_read
UPDATE contact_messages
SET status = CASE WHEN is_read = true THEN 'read' ELSE 'unread' END
WHERE status = 'unread' AND is_read = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_status_check'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_status_check
      CHECK (status IN ('unread', 'read', 'replied', 'archived', 'deleted'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages (status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_sender_id ON contact_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_sender_email ON contact_messages (email);

CREATE TABLE IF NOT EXISTS message_replies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  admin_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  body        TEXT NOT NULL,
  attachment  VARCHAR(500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_replies_message_id ON message_replies (message_id);
