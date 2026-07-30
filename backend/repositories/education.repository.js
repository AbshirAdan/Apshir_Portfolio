const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class EducationRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.EDUCATION);
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
      `INSERT INTO ${this.tableName} (user_id, school, degree, field, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.user_id,
        data.school,
        data.degree || null,
        data.field || null,
        data.start_date || null,
        data.end_date || null,
      ]
    );
    return rows[0];
  }

  async update(id, data) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET school = COALESCE($1, school),
           degree = COALESCE($2, degree),
           field = COALESCE($3, field),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date)
       WHERE id = $6
       RETURNING *`,
      [data.school, data.degree, data.field, data.start_date, data.end_date, id]
    );
    return rows[0] || null;
  }
}

module.exports = EducationRepository;
