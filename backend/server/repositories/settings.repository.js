const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class SettingsRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.SETTINGS);
  }

  async getSingleton() {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} ORDER BY created_at ASC LIMIT 1`
    );
    return rows[0] || null;
  }

  async upsert(data) {
    const existing = await this.getSingleton();

    if (!existing) {
      const { rows } = await this.query(
        `INSERT INTO ${this.tableName}
         (site_title, hero_title, hero_subtitle, hero_description, logo, favicon,
          primary_color, secondary_color, seo_meta_title, seo_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          data.site_title || null,
          data.hero_title || null,
          data.hero_subtitle || null,
          data.hero_description || null,
          data.logo || null,
          data.favicon || null,
          data.primary_color || '#4F46E5',
          data.secondary_color || '#6366F1',
          data.seo_meta_title || null,
          data.seo_description || null,
        ]
      );
      return rows[0];
    }

    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET site_title = COALESCE($1, site_title),
           hero_title = COALESCE($2, hero_title),
           hero_subtitle = COALESCE($3, hero_subtitle),
           hero_description = COALESCE($4, hero_description),
           logo = COALESCE($5, logo),
           favicon = COALESCE($6, favicon),
           primary_color = COALESCE($7, primary_color),
           secondary_color = COALESCE($8, secondary_color),
           seo_meta_title = COALESCE($9, seo_meta_title),
           seo_description = COALESCE($10, seo_description),
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        data.site_title,
        data.hero_title,
        data.hero_subtitle,
        data.hero_description,
        data.logo,
        data.favicon,
        data.primary_color,
        data.secondary_color,
        data.seo_meta_title,
        data.seo_description,
        existing.id,
      ]
    );
    return rows[0];
  }
}

module.exports = SettingsRepository;
