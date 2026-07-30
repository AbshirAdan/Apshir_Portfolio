-- ============================================================
-- Phase: Professional Communication Center
-- conversations / messages / attachments / notifications / presence
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_name           VARCHAR(255) NOT NULL,
  guest_email          VARCHAR(255) NOT NULL,
  subject              VARCHAR(255) NOT NULL,
  status               VARCHAR(20) NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open', 'archived', 'deleted')),
  is_pinned            BOOLEAN NOT NULL DEFAULT false,
  last_message_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_preview TEXT,
  admin_unread_count   INT NOT NULL DEFAULT 0,
  user_unread_count    INT NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_email ON conversations (LOWER(guest_email));
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations (last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations (status);
CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON conversations (is_pinned DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_role      VARCHAR(20) NOT NULL
                     CHECK (sender_role IN ('admin', 'user', 'guest')),
  sender_name      VARCHAR(255) NOT NULL,
  body             TEXT NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'sent'
                     CHECK (status IN ('sent', 'delivered', 'seen', 'deleted')),
  edited_at        TIMESTAMPTZ,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON chat_messages (status);

CREATE TABLE IF NOT EXISTS message_attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_name    VARCHAR(255) NOT NULL,
  file_path    VARCHAR(500) NOT NULL,
  file_type    VARCHAR(120),
  file_size    INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments (message_id);

CREATE TABLE IF NOT EXISTS notifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             VARCHAR(50) NOT NULL,
  title            VARCHAR(255) NOT NULL,
  body             TEXT,
  conversation_id  UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id       UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_read          BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id, is_read);

CREATE TABLE IF NOT EXISTS user_presence (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_online  BOOLEAN NOT NULL DEFAULT false,
  last_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate legacy contact_messages into conversations + chat_messages (once)
DO $$
DECLARE
  r RECORD;
  conv_id UUID;
  msg_id UUID;
  reply_msg_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'contact_messages'
  ) AND NOT EXISTS (
    SELECT 1 FROM conversations LIMIT 1
  ) THEN
    FOR r IN
      SELECT * FROM contact_messages
      WHERE COALESCE(status, 'unread') != 'deleted'
      ORDER BY created_at ASC
    LOOP
      INSERT INTO conversations (
        user_id, guest_name, guest_email, subject, status,
        last_message_at, last_message_preview,
        admin_unread_count, user_unread_count, created_at, updated_at
      ) VALUES (
        r.sender_id,
        r.full_name,
        r.email,
        COALESCE(NULLIF(r.subject, ''), 'Contact message'),
        CASE WHEN r.status = 'archived' THEN 'archived' ELSE 'open' END,
        COALESCE(r.replied_at, r.updated_at, r.created_at),
        COALESCE(r.reply, LEFT(r.message, 200)),
        CASE WHEN COALESCE(r.status, 'unread') = 'unread' THEN 1 ELSE 0 END,
        CASE WHEN r.reply IS NOT NULL AND (r.user_read_at IS NULL OR r.user_read_at < r.replied_at) THEN 1 ELSE 0 END,
        r.created_at,
        COALESCE(r.updated_at, r.created_at)
      ) RETURNING id INTO conv_id;

      INSERT INTO chat_messages (
        conversation_id, sender_id, sender_role, sender_name, body, status, created_at, updated_at
      ) VALUES (
        conv_id,
        r.sender_id,
        CASE WHEN r.sender_id IS NOT NULL THEN 'user' ELSE 'guest' END,
        r.full_name,
        r.message,
        CASE WHEN COALESCE(r.status, 'unread') = 'unread' THEN 'delivered' ELSE 'seen' END,
        r.created_at,
        COALESCE(r.updated_at, r.created_at)
      ) RETURNING id INTO msg_id;

      IF r.attachment IS NOT NULL THEN
        INSERT INTO message_attachments (message_id, file_name, file_path, file_type)
        VALUES (msg_id, split_part(r.attachment, '/', -1), r.attachment, NULL);
      END IF;

      IF r.reply IS NOT NULL AND LENGTH(TRIM(r.reply)) > 0 THEN
        INSERT INTO chat_messages (
          conversation_id, sender_id, sender_role, sender_name, body, status, created_at, updated_at
        ) VALUES (
          conv_id,
          r.replied_by,
          'admin',
          'Admin',
          r.reply,
          CASE WHEN r.user_read_at IS NOT NULL THEN 'seen' ELSE 'delivered' END,
          COALESCE(r.replied_at, r.updated_at, NOW()),
          COALESCE(r.replied_at, r.updated_at, NOW())
        ) RETURNING id INTO reply_msg_id;

        IF r.attachment IS NOT NULL AND r.replied_at IS NOT NULL THEN
          -- keep attachment on original if it was user-side; skip duplicate
          NULL;
        END IF;
      END IF;
    END LOOP;
  END IF;
END $$;
