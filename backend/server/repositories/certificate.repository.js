const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class CertificateRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.CERTIFICATES);
  }

  async create(data) {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (title, organization, issue_date, credential_url, image)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.title,
        data.organization || null,
        data.issue_date || null,
        data.credential_url || null,
        data.image || null,
      ]
    );
    return rows[0];
  }

  async update(id, data) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET title = COALESCE($1, title),
           organization = COALESCE($2, organization),
           issue_date = COALESCE($3, issue_date),
           credential_url = COALESCE($4, credential_url),
           image = COALESCE($5, image)
       WHERE id = $6
       RETURNING *`,
      [data.title, data.organization, data.issue_date, data.credential_url, data.image, id]
    );
    return rows[0] || null;
  }
}

module.exports = CertificateRepository;
