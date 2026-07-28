const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class SocialLinkRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.SOCIAL_LINKS);
  }

  async findAll() {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} ORDER BY display_order ASC, created_at ASC`
    );
    return rows;
  }

  async create(data) {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (platform, url, icon, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.platform, data.url, data.icon || null, data.display_order ?? 0]
    );
    return rows[0];
  }

  async update(id, data) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET platform = COALESCE($1, platform),
           url = COALESCE($2, url),
           icon = COALESCE($3, icon),
           display_order = COALESCE($4, display_order)
       WHERE id = $5
       RETURNING *`,
      [data.platform, data.url, data.icon, data.display_order, id]
    );
    return rows[0] || null;
  }
}

module.exports = SocialLinkRepository;
