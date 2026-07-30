const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

const ADMIN_USER_FIELDS =
  'id, full_name, email, role, avatar, phone, bio, career_objective, location, city, country, google_map_link, google_map_embed, status, provider, provider_id, last_login, created_at, updated_at';
const PUBLIC_USER_FIELDS =
  'id, full_name, email, role, avatar, phone, bio, career_objective, location, city, country, google_map_link, google_map_embed, status, created_at, updated_at';

const SORT_MAP = {
  name: 'full_name',
  email: 'email',
  created_at: 'created_at',
  last_login: 'last_login',
  registration_date: 'created_at',
};

class UserRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.USERS);
  }

  async findByEmail(email) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email.toLowerCase()]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findPublicById(id) {
    const { rows } = await this.query(
      `SELECT ${PUBLIC_USER_FIELDS} FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async createAdmin({ full_name, email, password, role = 'admin' }) {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (full_name, email, password, role, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING ${PUBLIC_USER_FIELDS}`,
      [full_name, email.toLowerCase(), password, role]
    );
    return rows[0];
  }

  async createUser({ full_name, email, password, phone = null, avatar = null, role = 'user' }) {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (full_name, email, password, role, phone, avatar, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING ${PUBLIC_USER_FIELDS}`,
      [full_name, email.toLowerCase(), password, role, phone || null, avatar]
    );
    return rows[0];
  }

  async createOAuthUser({ full_name, email, avatar, provider, provider_id, role = 'user' }) {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (full_name, email, avatar, provider, provider_id, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING ${PUBLIC_USER_FIELDS}`,
      [full_name, email.toLowerCase(), avatar, provider, provider_id, role]
    );
    return rows[0];
  }

  async findByProvider(provider, provider_id) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE provider = $1 AND provider_id = $2`,
      [provider, provider_id]
    );
    return rows[0] || null;
  }

  async setResetToken(id, token, expiresAt) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET reset_token = $1, reset_token_expires = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING ${PUBLIC_USER_FIELDS}`,
      [token, expiresAt, id]
    );
    return rows[0] || null;
  }

  async findByResetToken(token) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName}
       WHERE reset_token = $1
         AND reset_token_expires IS NOT NULL
         AND reset_token_expires > NOW()`,
      [token]
    );
    return rows[0] || null;
  }

  async clearResetToken(id) {
    await this.query(
      `UPDATE ${this.tableName}
       SET reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }

  async updatePassword(id, hashedPassword) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET password = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING ${PUBLIC_USER_FIELDS}`,
      [hashedPassword, id]
    );
    return rows[0] || null;
  }

  async updateProfile(id, data) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           bio = COALESCE($4, bio),
           career_objective = COALESCE($5, career_objective),
           location = COALESCE($6, location),
           city = COALESCE($7, city),
           country = COALESCE($8, country),
           google_map_link = COALESCE($9, google_map_link),
           google_map_embed = COALESCE($10, google_map_embed),
           updated_at = NOW()
       WHERE id = $11
       RETURNING ${PUBLIC_USER_FIELDS}`,
      [
        data.full_name,
        data.email?.toLowerCase(),
        data.phone,
        data.bio,
        data.career_objective,
        data.location,
        data.city,
        data.country,
        data.google_map_link,
        data.google_map_embed,
        id
      ]
    );
    return rows[0] || null;
  }

  async updateAvatar(id, avatar) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET avatar = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING ${PUBLIC_USER_FIELDS}`,
      [avatar, id]
    );
    return rows[0] || null;
  }

  async findByEmailExcludingId(email, excludeId) {
    const { rows } = await this.query(
      `SELECT id FROM ${this.tableName} WHERE email = $1 AND id != $2`,
      [email.toLowerCase(), excludeId]
    );
    return rows[0] || null;
  }

  async findAdminProfile() {
    const { rows } = await this.query(
      `SELECT ${PUBLIC_USER_FIELDS} FROM ${this.tableName}
       WHERE role = 'admin'
       ORDER BY created_at ASC
       LIMIT 1`
    );
    return rows[0] || null;
  }

  async updateLastLogin(id) {
    await this.query(
      `UPDATE ${this.tableName}
       SET last_login = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }

  async updateStatus(id, status) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING ${ADMIN_USER_FIELDS}`,
      [status, id]
    );
    return rows[0] || null;
  }

  async updateRole(id, role) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET role = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING ${ADMIN_USER_FIELDS}`,
      [role, id]
    );
    return rows[0] || null;
  }

  async adminUpdate(id, { full_name, email, phone, bio, role, status, avatar }) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           bio = COALESCE($4, bio),
           role = COALESCE($5, role),
           status = COALESCE($6, status),
           avatar = COALESCE($7, avatar),
           updated_at = NOW()
       WHERE id = $8
       RETURNING ${ADMIN_USER_FIELDS}`,
      [
        full_name ?? null,
        email ? email.toLowerCase() : null,
        phone ?? null,
        bio ?? null,
        role ?? null,
        status ?? null,
        avatar ?? null,
        id,
      ]
    );
    return rows[0] || null;
  }

  _buildAdminFilters({ search, role, status }) {
    const conditions = [];
    const params = [];
    let i = 1;

    if (search) {
      conditions.push(
        `(full_name ILIKE $${i} OR email ILIKE $${i} OR COALESCE(phone, '') ILIKE $${i})`
      );
      params.push(`%${search}%`);
      i += 1;
    }

    if (role) {
      conditions.push(`role = $${i}`);
      params.push(role);
      i += 1;
    }

    if (status) {
      conditions.push(`status = $${i}`);
      params.push(status);
      i += 1;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return { where, params, nextIndex: i };
  }

  async findAdminList({
    search = null,
    role = null,
    status = null,
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit = 10,
    offset = 0,
  }) {
    const { where, params, nextIndex } = this._buildAdminFilters({ search, role, status });
    const column = SORT_MAP[sortBy] || 'created_at';
    const direction = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const nulls = column === 'last_login' ? ' NULLS LAST' : '';

    const listParams = [...params, limit, offset];
    const { rows } = await this.query(
      `SELECT ${ADMIN_USER_FIELDS}
       FROM ${this.tableName}
       ${where}
       ORDER BY ${column} ${direction}${nulls}
       LIMIT $${nextIndex} OFFSET $${nextIndex + 1}`,
      listParams
    );
    return rows;
  }

  async countAdminFiltered({ search = null, role = null, status = null }) {
    const { where, params } = this._buildAdminFilters({ search, role, status });
    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${this.tableName} ${where}`,
      params
    );
    return rows[0].count;
  }

  async getAdminStats() {
    const { rows } = await this.query(
      `SELECT
         COUNT(*)::int AS total_users,
         COUNT(*) FILTER (WHERE status = 'active')::int AS active_users,
         COUNT(*) FILTER (WHERE status = 'inactive')::int AS inactive_users,
         COUNT(*) FILTER (WHERE status = 'blocked')::int AS blocked_users,
         COUNT(*) FILTER (WHERE role = 'admin')::int AS administrators,
         COUNT(*) FILTER (
           WHERE created_at >= date_trunc('month', NOW())
         )::int AS new_users_this_month
       FROM ${this.tableName}`
    );
    return rows[0];
  }

  async countAdmins() {
    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${this.tableName} WHERE role = 'admin'`
    );
    return rows[0].count;
  }
}

module.exports = UserRepository;
module.exports.ADMIN_USER_FIELDS = ADMIN_USER_FIELDS;
module.exports.PUBLIC_USER_FIELDS = PUBLIC_USER_FIELDS;
