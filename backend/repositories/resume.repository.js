const fs = require('fs');
const path = require('path');
const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');
const config = require('../config');

class ResumeRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.RESUMES);
  }

  async findAll() {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} ORDER BY is_active DESC, updated_at DESC, created_at DESC`
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await this.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return rows[0] || null;
  }

  async getActive() {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE is_active = true ORDER BY updated_at DESC LIMIT 1`
    );
    return rows[0] || null;
  }

  async create(data) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE ${this.tableName} SET is_active = false WHERE is_active = true`);
      const { rows } = await client.query(
        `INSERT INTO ${this.tableName}
           (file_url, file_name, file_size, page_count, version, description, is_active, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
         RETURNING *`,
        [
          data.file_url,
          data.file_name || null,
          data.file_size || null,
          data.page_count || null,
          data.version || '1.0',
          data.description || null,
        ]
      );
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateById(id, { version, description }) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET version = COALESCE($1, version),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [version ?? null, description ?? null, id]
    );
    return rows[0] || null;
  }

  async deleteById(id) {
    const row = await this.findById(id);
    if (!row) return null;

    const wasActive = row.is_active;
    const { rows } = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`,
      [id]
    );

    if (row.file_url) {
      const filename = row.file_url.split('/').pop();
      if (filename) {
        const diskPath = path.join(config.upload.root, 'resumes', filename);
        if (fs.existsSync(diskPath)) {
          try {
            fs.unlinkSync(diskPath);
          } catch {
            /* ignore */
          }
        }
      }
    }

    if (wasActive) {
      await this.query(
        `UPDATE ${this.tableName}
         SET is_active = true, updated_at = NOW()
         WHERE id = (
           SELECT id FROM ${this.tableName} ORDER BY updated_at DESC LIMIT 1
         )`
      );
    }

    return rows[0] || null;
  }
}

module.exports = ResumeRepository;
