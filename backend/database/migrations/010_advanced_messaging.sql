-- ============================================================
-- Phase: Advanced Real-Time Messaging Features
-- reactions, read receipts timestamps, notification reference_id
-- ============================================================

CREATE TABLE IF NOT EXISTS message_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction    VARCHAR(16) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_message_user_reaction UNIQUE (message_id, user_id, reaction),
  CONSTRAINT chk_reaction_emoji CHECK (
    reaction IN ('👍', '❤️', '😂', '🎉', '👏', '🔥', '😮', '😢')
  )
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions (message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions (user_id);

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ;

-- Backfill timestamps from status where possible
UPDATE chat_messages
SET delivered_at = COALESCE(delivered_at, updated_at, created_at)
WHERE status IN ('delivered', 'seen') AND delivered_at IS NULL;

UPDATE chat_messages
SET seen_at = COALESCE(seen_at, updated_at)
WHERE status = 'seen' AND seen_at IS NULL;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS reference_id UUID;

UPDATE notifications
SET reference_id = conversation_id
WHERE reference_id IS NULL AND conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_reference ON notifications (reference_id);
