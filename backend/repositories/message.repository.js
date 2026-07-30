const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class MessageRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.CONTACT_MESSAGES);
  }

  _buildFilters({ search, status }) {
    const conditions = [`status != 'deleted'`];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(full_name ILIKE $${idx} OR email ILIKE $${idx} OR COALESCE(subject, '') ILIKE $${idx} OR message ILIKE $${idx})`
      );
      params.push(`%${search}%`);
      idx += 1;
    }

    if (status) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx += 1;
    }

    return {
      where: `WHERE ${conditions.join(' AND ')}`,
      params,
      nextIndex: idx,
    };
  }

  async findAll({ search, status, sortOrder = 'desc', limit, offset }) {
    const { where, params, nextIndex } = this._buildFilters({ search, status });
    const direction = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const listParams = [...params, limit, offset];

    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} ${where}
       ORDER BY created_at ${direction}
       LIMIT $${nextIndex} OFFSET $${nextIndex + 1}`,
      listParams
    );
    return rows;
  }

  async countFiltered({ search, status }) {
    const { where, params } = this._buildFilters({ search, status });
    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${this.tableName} ${where}`,
      params
    );
    return rows[0].count;
  }

  async countByStatus() {
    const { rows } = await this.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'unread')::int AS unread,
         COUNT(*) FILTER (WHERE status = 'read')::int AS read,
         COUNT(*) FILTER (WHERE status = 'replied')::int AS replied,
         COUNT(*) FILTER (WHERE status = 'archived')::int AS archived,
         COUNT(*) FILTER (WHERE status != 'deleted')::int AS total
       FROM ${this.tableName}`
    );
    return rows[0];
  }

  async countUnread() {
    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${this.tableName}
       WHERE status = 'unread'`
    );
    return rows[0].count;
  }

  async findByIdPublic(id) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName}
       WHERE id = $1 AND status != 'deleted'`,
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName}
         (full_name, email, subject, message, sender_id, status, is_read)
       VALUES ($1, $2, $3, $4, $5, 'unread', false)
       RETURNING *`,
      [
        data.full_name || data.sender_name,
        data.email || data.sender_email,
        data.subject || null,
        data.message,
        data.sender_id || null,
      ]
    );
    return rows[0];
  }

  async markRead(id) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET is_read = true,
           status = CASE WHEN status = 'unread' THEN 'read' ELSE status END,
           read_at = COALESCE(read_at, NOW()),
           updated_at = NOW()
       WHERE id = $1 AND status != 'deleted'
       RETURNING *`,
      [id]
    );
    return rows[0] || null;
  }

  async setStatus(id, status) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET status = $1,
           is_read = CASE WHEN $1 = 'unread' THEN false ELSE true END,
           updated_at = NOW()
       WHERE id = $2 AND status != 'deleted'
       RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET status = 'deleted', updated_at = NOW()
       WHERE id = $1 AND status != 'deleted'
       RETURNING *`,
      [id]
    );
    return rows[0] || null;
  }

  async saveReply(id, { reply, replied_by, attachment }) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET reply = $1,
           replied_by = $2,
           replied_at = NOW(),
           attachment = COALESCE($3, attachment),
           status = 'replied',
           is_read = true,
           read_at = COALESCE(read_at, NOW()),
           updated_at = NOW()
       WHERE id = $4 AND status != 'deleted'
       RETURNING *`,
      [reply, replied_by, attachment || null, id]
    );
    return rows[0] || null;
  }

  async addReplyHistory({ message_id, admin_id, body, attachment }) {
    const { rows } = await this.query(
      `INSERT INTO message_replies (message_id, admin_id, body, attachment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [message_id, admin_id, body, attachment || null]
    );
    return rows[0];
  }

  async getReplies(messageId) {
    const { rows } = await this.query(
      `SELECT r.*, u.full_name AS admin_name, u.email AS admin_email
       FROM message_replies r
       LEFT JOIN users u ON u.id = r.admin_id
       WHERE r.message_id = $1
       ORDER BY r.created_at ASC`,
      [messageId]
    );
    return rows;
  }

  async findForUser({ senderId, email, search, status, limit, offset }) {
    const conditions = [
      `status != 'deleted'`,
      `(sender_id = $1 OR LOWER(email) = LOWER($2))`,
    ];
    const params = [senderId, email];
    let idx = 3;

    if (search) {
      conditions.push(
        `(COALESCE(subject, '') ILIKE $${idx} OR message ILIKE $${idx} OR COALESCE(reply, '') ILIKE $${idx})`
      );
      params.push(`%${search}%`);
      idx += 1;
    }

    if (status === 'replied') {
      conditions.push(`status = 'replied'`);
    } else if (status === 'unread_replies') {
      conditions.push(`status = 'replied' AND (user_read_at IS NULL OR user_read_at < replied_at)`);
    } else if (status === 'read_replies') {
      conditions.push(`status = 'replied' AND user_read_at IS NOT NULL AND user_read_at >= replied_at`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    params.push(limit, offset);

    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );
    return rows;
  }

  async countForUser({ senderId, email, search, status }) {
    const conditions = [
      `status != 'deleted'`,
      `(sender_id = $1 OR LOWER(email) = LOWER($2))`,
    ];
    const params = [senderId, email];
    let idx = 3;

    if (search) {
      conditions.push(
        `(COALESCE(subject, '') ILIKE $${idx} OR message ILIKE $${idx} OR COALESCE(reply, '') ILIKE $${idx})`
      );
      params.push(`%${search}%`);
      idx += 1;
    }

    if (status === 'replied') {
      conditions.push(`status = 'replied'`);
    } else if (status === 'unread_replies') {
      conditions.push(`status = 'replied' AND (user_read_at IS NULL OR user_read_at < replied_at)`);
    } else if (status === 'read_replies') {
      conditions.push(`status = 'replied' AND user_read_at IS NOT NULL AND user_read_at >= replied_at`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${this.tableName} ${where}`,
      params
    );
    return rows[0].count;
  }

  async countUnreadRepliesForUser({ senderId, email }) {
    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${this.tableName}
       WHERE status = 'replied'
         AND status != 'deleted'
         AND (sender_id = $1 OR LOWER(email) = LOWER($2))
         AND (user_read_at IS NULL OR user_read_at < replied_at)`,
      [senderId, email]
    );
    return rows[0].count;
  }

  async findOwnedByUser(id, { senderId, email }) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName}
       WHERE id = $1
         AND status != 'deleted'
         AND (sender_id = $2 OR LOWER(email) = LOWER($3))`,
      [id, senderId, email]
    );
    return rows[0] || null;
  }

  async markUserRead(id) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET user_read_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status != 'deleted'
       RETURNING *`,
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = MessageRepository;
