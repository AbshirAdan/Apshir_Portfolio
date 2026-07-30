const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class SkillRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.SKILLS);
  }

  async findAll() {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} ORDER BY display_order ASC, created_at ASC`
    );
    return rows;
  }

  async create(data) {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (name, percentage, icon, category, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.name,
        data.percentage ?? 0,
        data.icon || null,
        data.category || null,
        data.display_order ?? 0,
      ]
    );
    return rows[0];
  }

  async update(id, data) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET name = COALESCE($1, name),
           percentage = COALESCE($2, percentage),
           icon = COALESCE($3, icon),
           category = COALESCE($4, category),
           display_order = COALESCE($5, display_order)
       WHERE id = $6
       RETURNING *`,
      [data.name, data.percentage, data.icon, data.category, data.display_order, id]
    );
    return rows[0] || null;
  }
}

module.exports = SkillRepository;
