const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class ExperienceRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.EXPERIENCE);
  }

  async findAll(userId) {
    const params = [];
    let where = '';
    if (userId) {
      where = 'WHERE user_id = $1';
      params.push(userId);
    }
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} ${where} ORDER BY start_date DESC NULLS LAST, created_at DESC`,
      params
    );
    return rows;
  }

  async create(data) {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (user_id, company, position, start_date, end_date, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.user_id,
        data.company,
        data.position || null,
        data.start_date || null,
        data.end_date || null,
        data.description || null,
      ]
    );
    return rows[0];
  }

  async update(id, data) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET company = COALESCE($1, company),
           position = COALESCE($2, position),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           description = COALESCE($5, description)
       WHERE id = $6
       RETURNING *`,
      [data.company, data.position, data.start_date, data.end_date, data.description, id]
    );
    return rows[0] || null;
  }
}

module.exports = ExperienceRepository;
