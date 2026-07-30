const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class ProjectRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.PROJECTS);
    this.imagesTable = TABLES.PROJECT_IMAGES;
  }

  async findAll({ search, status, category, featured, limit, offset }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(title ILIKE $${idx} OR short_description ILIKE $${idx} OR full_description ILIKE $${idx})`
      );
      params.push(`%${search}%`);
      idx += 1;
    }

    if (status) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx += 1;
    }

    if (category) {
      conditions.push(`category = $${idx}`);
      params.push(category);
      idx += 1;
    }

    if (featured !== undefined && featured !== null) {
      conditions.push(`featured = $${idx}`);
      params.push(featured);
      idx += 1;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(limit, offset);
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );
    return rows;
  }

  async countFiltered({ search, status, category, featured }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(title ILIKE $${idx} OR short_description ILIKE $${idx} OR full_description ILIKE $${idx})`
      );
      params.push(`%${search}%`);
      idx += 1;
    }

    if (status) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx += 1;
    }

    if (category) {
      conditions.push(`category = $${idx}`);
      params.push(category);
      idx += 1;
    }

    if (featured !== undefined && featured !== null) {
      conditions.push(`featured = $${idx}`);
      params.push(featured);
      idx += 1;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${this.tableName} ${where}`,
      params
    );
    return rows[0].count;
  }

  async findBySlug(slug, publishedOnly = false) {
    const conditions = ['slug = $1'];
    const params = [slug];
    if (publishedOnly) {
      conditions.push("status = 'published'");
    }
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE ${conditions.join(' AND ')}`,
      params
    );
    return rows[0] || null;
  }

  async findBySlugExcludingId(slug, excludeId) {
    const { rows } = await this.query(
      `SELECT id FROM ${this.tableName} WHERE slug = $1 AND id != $2`,
      [slug, excludeId]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName}
       (user_id, title, slug, short_description, full_description, technologies,
        github_url, live_demo_url, thumbnail, featured, status, category,
        start_date, completion_date, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        data.user_id,
        data.title,
        data.slug,
        data.short_description || null,
        data.full_description || null,
        JSON.stringify(data.technologies || []),
        data.github_url || null,
        data.live_demo_url || null,
        data.thumbnail || null,
        data.featured ?? false,
        data.status || 'draft',
        data.category || 'General',
        data.start_date || null,
        data.completion_date || null,
        data.display_order || 0,
      ]
    );
    return rows[0];
  }

  async update(id, data) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           short_description = COALESCE($3, short_description),
           full_description = COALESCE($4, full_description),
           technologies = COALESCE($5, technologies),
           github_url = COALESCE($6, github_url),
           live_demo_url = COALESCE($7, live_demo_url),
           thumbnail = COALESCE($8, thumbnail),
           featured = COALESCE($9, featured),
           status = COALESCE($10, status),
           category = COALESCE($11, category),
           start_date = COALESCE($12, start_date),
           completion_date = COALESCE($13, completion_date),
           display_order = COALESCE($14, display_order),
           updated_at = NOW()
       WHERE id = $15
       RETURNING *`,
      [
        data.title,
        data.slug,
        data.short_description,
        data.full_description,
        data.technologies !== undefined ? JSON.stringify(data.technologies) : null,
        data.github_url,
        data.live_demo_url,
        data.thumbnail,
        data.featured,
        data.status,
        data.category,
        data.start_date,
        data.completion_date,
        data.display_order,
        id,
      ]
    );
    return rows[0] || null;
  }

  async findImages(projectId) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.imagesTable} WHERE project_id = $1 ORDER BY created_at ASC`,
      [projectId]
    );
    return rows;
  }

  async addImage(projectId, image) {
    const { rows } = await this.query(
      `INSERT INTO ${this.imagesTable} (project_id, image) VALUES ($1, $2) RETURNING *`,
      [projectId, image]
    );
    return rows[0];
  }

  async deleteImage(imageId) {
    const { rows } = await this.query(
      `DELETE FROM ${this.imagesTable} WHERE id = $1 RETURNING *`,
      [imageId]
    );
    return rows[0] || null;
  }

  async findImageById(imageId) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.imagesTable} WHERE id = $1`,
      [imageId]
    );
    return rows[0] || null;
  }
}

module.exports = ProjectRepository;
