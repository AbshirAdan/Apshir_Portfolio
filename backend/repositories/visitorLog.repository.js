const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class VisitorLogRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.VISITOR_LOGS);
  }

  async create(data) {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName}
       (ip_address, browser, operating_system, country, device, page, referrer)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.ip_address || null,
        data.browser || null,
        data.operating_system || null,
        data.country || null,
        data.device || null,
        data.page || null,
        data.referrer || null,
      ]
    );
    return rows[0];
  }

  async countAll() {
    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${this.tableName}`
    );
    return rows[0].count;
  }
}

module.exports = VisitorLogRepository;
