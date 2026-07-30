const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class CommunicationRepository {
  constructor() {
    this.pool = pool;
  }

  query(text, params = []) {
    return this.pool.query(text, params);
  }

  async createConversation({
    user_id = null,
    guest_name,
    guest_email,
    subject,
    preview,
  }) {
    const { rows } = await this.query(
      `INSERT INTO ${TABLES.CONVERSATIONS}
         (user_id, guest_name, guest_email, subject, last_message_preview, admin_unread_count, user_unread_count)
       VALUES ($1, $2, $3, $4, $5, 1, 0)
       RETURNING *`,
      [user_id, guest_name, guest_email.toLowerCase(), subject, preview]
    );
    return rows[0];
  }

  async findConversationById(id) {
    const { rows } = await this.query(
      `SELECT c.*,
              u.avatar AS user_avatar,
              u.full_name AS user_full_name,
              p.is_online,
              p.last_seen
       FROM ${TABLES.CONVERSATIONS} c
       LEFT JOIN ${TABLES.USERS} u ON u.id = c.user_id
       LEFT JOIN ${TABLES.USER_PRESENCE} p ON p.user_id = c.user_id
       WHERE c.id = $1 AND c.status != 'deleted'`,
      [id]
    );
    return rows[0] || null;
  }

  async listConversations({
    search = null,
    status = null,
    sort = 'newest',
    limit = 20,
    offset = 0,
    forUserId = null,
    forEmail = null,
  }) {
    const conditions = [`c.status != 'deleted'`];
    const params = [];
    let i = 1;

    if (forUserId || forEmail) {
      conditions.push(`(c.user_id = $${i} OR LOWER(c.guest_email) = LOWER($${i + 1}))`);
      params.push(forUserId, forEmail);
      i += 2;
      conditions.push(`c.status != 'deleted'`);
    }

    if (status === 'archived') {
      conditions.push(`c.status = 'archived'`);
    } else if (status === 'open' || status === 'read' || status === 'unread') {
      conditions.push(`c.status = 'open'`);
      if (status === 'unread') {
        if (forUserId || forEmail) conditions.push(`c.user_unread_count > 0`);
        else conditions.push(`c.admin_unread_count > 0`);
      } else if (status === 'read') {
        if (forUserId || forEmail) conditions.push(`c.user_unread_count = 0`);
        else conditions.push(`c.admin_unread_count = 0`);
      }
    }

    if (search) {
      conditions.push(
        `(c.guest_name ILIKE $${i} OR c.guest_email ILIKE $${i} OR c.subject ILIKE $${i} OR COALESCE(c.last_message_preview,'') ILIKE $${i})`
      );
      params.push(`%${search}%`);
      i += 1;
    }

    const direction = sort === 'oldest' ? 'ASC' : 'DESC';
    const where = `WHERE ${conditions.join(' AND ')}`;
    params.push(limit, offset);

    const { rows } = await this.query(
      `SELECT c.*,
              u.avatar AS user_avatar,
              p.is_online,
              p.last_seen
       FROM ${TABLES.CONVERSATIONS} c
       LEFT JOIN ${TABLES.USERS} u ON u.id = c.user_id
       LEFT JOIN ${TABLES.USER_PRESENCE} p ON p.user_id = c.user_id
       ${where}
       ORDER BY c.is_pinned DESC, c.last_message_at ${direction}
       LIMIT $${i} OFFSET $${i + 1}`,
      params
    );
    return rows;
  }

  async countConversations(filters) {
    const list = await this.listConversations({ ...filters, limit: 100000, offset: 0 });
    return list.length;
  }

  async countConversationsFiltered({
    search = null,
    status = null,
    forUserId = null,
    forEmail = null,
  }) {
    const conditions = [`status != 'deleted'`];
    const params = [];
    let i = 1;

    if (forUserId || forEmail) {
      conditions.push(`(user_id = $${i} OR LOWER(guest_email) = LOWER($${i + 1}))`);
      params.push(forUserId, forEmail);
      i += 2;
    }

    if (status === 'archived') conditions.push(`status = 'archived'`);
    else if (status === 'open' || status === 'read' || status === 'unread') {
      conditions.push(`status = 'open'`);
      if (status === 'unread') {
        if (forUserId || forEmail) conditions.push(`user_unread_count > 0`);
        else conditions.push(`admin_unread_count > 0`);
      } else if (status === 'read') {
        if (forUserId || forEmail) conditions.push(`user_unread_count = 0`);
        else conditions.push(`admin_unread_count = 0`);
      }
    }

    if (search) {
      conditions.push(
        `(guest_name ILIKE $${i} OR guest_email ILIKE $${i} OR subject ILIKE $${i} OR COALESCE(last_message_preview,'') ILIKE $${i})`
      );
      params.push(`%${search}%`);
      i += 1;
    }

    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${TABLES.CONVERSATIONS} WHERE ${conditions.join(' AND ')}`,
      params
    );
    return rows[0].count;
  }

  async getAdminStats() {
    const { rows } = await this.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'open')::int AS open,
         COUNT(*) FILTER (WHERE status = 'open' AND admin_unread_count > 0)::int AS unread,
         COUNT(*) FILTER (WHERE status = 'archived')::int AS archived,
         COUNT(*) FILTER (WHERE status != 'deleted')::int AS total
       FROM ${TABLES.CONVERSATIONS}`
    );
    return rows[0];
  }

  async updateConversation(id, fields) {
    const allowed = [
      'status',
      'is_pinned',
      'last_message_at',
      'last_message_preview',
      'admin_unread_count',
      'user_unread_count',
      'user_id',
      'guest_name',
      'subject',
    ];
    const sets = [];
    const params = [];
    let i = 1;
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${i}`);
        params.push(fields[key]);
        i += 1;
      }
    }
    if (!sets.length) return this.findConversationById(id);
    sets.push('updated_at = NOW()');
    params.push(id);
    const { rows } = await this.query(
      `UPDATE ${TABLES.CONVERSATIONS}
       SET ${sets.join(', ')}
       WHERE id = $${i}
       RETURNING *`,
      params
    );
    return rows[0] || null;
  }

  async softDeleteConversation(id) {
    return this.updateConversation(id, { status: 'deleted' });
  }

  async createMessage({
    conversation_id,
    sender_id = null,
    sender_role,
    sender_name,
    body,
    status = 'sent',
  }) {
    const { rows } = await this.query(
      `INSERT INTO ${TABLES.CHAT_MESSAGES}
         (conversation_id, sender_id, sender_role, sender_name, body, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [conversation_id, sender_id, sender_role, sender_name, body, status]
    );
    return rows[0];
  }

  async findMessageById(id) {
    const { rows } = await this.query(
      `SELECT * FROM ${TABLES.CHAT_MESSAGES} WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  async listMessages(conversationId, { limit = 100, before = null } = {}) {
    const params = [conversationId];
    let where = `conversation_id = $1 AND deleted_at IS NULL`;
    if (before) {
      params.push(before);
      where += ` AND created_at < $2`;
    }
    params.push(limit);
    const { rows } = await this.query(
      `SELECT * FROM ${TABLES.CHAT_MESSAGES}
       WHERE ${where}
       ORDER BY created_at ASC
       LIMIT $${params.length}`,
      params
    );
    return rows;
  }

  async updateMessage(id, { body, status, delivered_at, seen_at }) {
    const { rows } = await this.query(
      `UPDATE ${TABLES.CHAT_MESSAGES}
       SET body = COALESCE($1, body),
           status = COALESCE($2, status),
           delivered_at = COALESCE($3, delivered_at),
           seen_at = COALESCE($4, seen_at),
           edited_at = CASE WHEN $1 IS NOT NULL THEN NOW() ELSE edited_at END,
           updated_at = NOW()
       WHERE id = $5 AND deleted_at IS NULL
       RETURNING *`,
      [body ?? null, status ?? null, delivered_at ?? null, seen_at ?? null, id]
    );
    return rows[0] || null;
  }

  async softDeleteMessage(id) {
    const { rows } = await this.query(
      `UPDATE ${TABLES.CHAT_MESSAGES}
       SET status = 'deleted', deleted_at = NOW(), updated_at = NOW(), body = '[Message deleted]'
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return rows[0] || null;
  }

  async markMessagesSeen(conversationId, viewerRole) {
    const roles =
      viewerRole === 'admin' ? `('user', 'guest')` : `('admin')`;
    const { rows } = await this.query(
      `UPDATE ${TABLES.CHAT_MESSAGES}
       SET status = 'seen',
           seen_at = COALESCE(seen_at, NOW()),
           delivered_at = COALESCE(delivered_at, NOW()),
           updated_at = NOW()
       WHERE conversation_id = $1
         AND sender_role IN ${roles}
         AND status IN ('sent', 'delivered')
         AND deleted_at IS NULL
       RETURNING *`,
      [conversationId]
    );
    return rows;
  }

  async markMessagesDelivered(conversationId, forRole) {
    // Mark messages sent BY forRole as delivered (recipient connected)
    const roles = forRole === 'admin' ? `('admin')` : `('user', 'guest')`;
    const { rows } = await this.query(
      `UPDATE ${TABLES.CHAT_MESSAGES}
       SET status = 'delivered',
           delivered_at = COALESCE(delivered_at, NOW()),
           updated_at = NOW()
       WHERE conversation_id = $1
         AND sender_role IN ${roles}
         AND status = 'sent'
         AND deleted_at IS NULL
       RETURNING *`,
      [conversationId]
    );
    return rows;
  }

  async markMessageDelivered(messageId) {
    const { rows } = await this.query(
      `UPDATE ${TABLES.CHAT_MESSAGES}
       SET status = 'delivered',
           delivered_at = COALESCE(delivered_at, NOW()),
           updated_at = NOW()
       WHERE id = $1 AND status = 'sent' AND deleted_at IS NULL
       RETURNING *`,
      [messageId]
    );
    return rows[0] || null;
  }

  async addAttachment({ message_id, file_name, file_path, file_type, file_size }) {
    const { rows } = await this.query(
      `INSERT INTO ${TABLES.MESSAGE_ATTACHMENTS}
         (message_id, file_name, file_path, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [message_id, file_name, file_path, file_type || null, file_size || null]
    );
    return rows[0];
  }

  async getAttachmentsForMessages(messageIds) {
    if (!messageIds.length) return [];
    const { rows } = await this.query(
      `SELECT * FROM ${TABLES.MESSAGE_ATTACHMENTS}
       WHERE message_id = ANY($1::uuid[])
       ORDER BY created_at ASC`,
      [messageIds]
    );
    return rows;
  }

  async addReaction({ message_id, user_id, reaction }) {
    const { rows } = await this.query(
      `INSERT INTO ${TABLES.MESSAGE_REACTIONS} (message_id, user_id, reaction)
       VALUES ($1, $2, $3)
       ON CONFLICT (message_id, user_id, reaction) DO NOTHING
       RETURNING *`,
      [message_id, user_id, reaction]
    );
    return rows[0] || null;
  }

  async removeReaction({ message_id, user_id, reaction }) {
    const { rows } = await this.query(
      `DELETE FROM ${TABLES.MESSAGE_REACTIONS}
       WHERE message_id = $1 AND user_id = $2 AND reaction = $3
       RETURNING *`,
      [message_id, user_id, reaction]
    );
    return rows[0] || null;
  }

  async getReactionsForMessages(messageIds) {
    if (!messageIds.length) return [];
    const { rows } = await this.query(
      `SELECT r.*, u.full_name AS user_name
       FROM ${TABLES.MESSAGE_REACTIONS} r
       LEFT JOIN ${TABLES.USERS} u ON u.id = r.user_id
       WHERE r.message_id = ANY($1::uuid[])
       ORDER BY r.created_at ASC`,
      [messageIds]
    );
    return rows;
  }

  async createNotification({
    user_id,
    type,
    title,
    body = null,
    conversation_id = null,
    message_id = null,
    reference_id = null,
  }) {
    const ref = reference_id || conversation_id;
    const { rows } = await this.query(
      `INSERT INTO ${TABLES.NOTIFICATIONS}
         (user_id, type, title, body, conversation_id, message_id, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, type, title, body, conversation_id, message_id, ref]
    );
    return rows[0];
  }

  async listNotifications(userId, { limit = 30 } = {}) {
    const { rows } = await this.query(
      `SELECT * FROM ${TABLES.NOTIFICATIONS}
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  async countUnreadNotifications(userId) {
    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${TABLES.NOTIFICATIONS}
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return rows[0].count;
  }

  async markNotificationRead(id, userId) {
    const { rows } = await this.query(
      `UPDATE ${TABLES.NOTIFICATIONS}
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return rows[0] || null;
  }

  async markAllNotificationsRead(userId) {
    await this.query(
      `UPDATE ${TABLES.NOTIFICATIONS} SET is_read = true WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
  }

  async setPresence(userId, isOnline) {
    await this.query(
      `INSERT INTO ${TABLES.USER_PRESENCE} (user_id, is_online, last_seen)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET is_online = $2, last_seen = NOW()`,
      [userId, isOnline]
    );
  }

  async getPresence(userId) {
    const { rows } = await this.query(
      `SELECT * FROM ${TABLES.USER_PRESENCE} WHERE user_id = $1`,
      [userId]
    );
    return rows[0] || null;
  }

  async findAdminIds() {
    const { rows } = await this.query(
      `SELECT id, email, full_name FROM ${TABLES.USERS} WHERE role = 'admin'`
    );
    return rows;
  }
}

module.exports = CommunicationRepository;
