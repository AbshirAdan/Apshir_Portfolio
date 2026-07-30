const BaseRepository = require('./BaseRepository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class BlogRepository extends BaseRepository {
  constructor() {
    super(pool, TABLES.BLOGS);
  }

  async findAll({ search, published, limit, offset }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(title ILIKE $${idx} OR content ILIKE $${idx} OR excerpt ILIKE $${idx} OR category ILIKE $${idx})`
      );
      params.push(`%${search}%`);
      idx += 1;
    }

    if (published !== undefined && published !== null) {
      conditions.push(`published = $${idx}`);
      params.push(published);
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

  async countFiltered({ search, published }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(title ILIKE $${idx} OR content ILIKE $${idx} OR excerpt ILIKE $${idx} OR category ILIKE $${idx})`
      );
      params.push(`%${search}%`);
      idx += 1;
    }

    if (published !== undefined && published !== null) {
      conditions.push(`published = $${idx}`);
      params.push(published);
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
      conditions.push('published = true');
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
       (user_id, title, slug, category, cover_image, content, excerpt, tags, status, reading_time, seo_title, seo_description, featured, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        data.user_id,
        data.title,
        data.slug,
        data.category,
        data.cover_image || null,
        data.content || '',
        data.excerpt || '',
        data.tags?.length ? data.tags : [],
        data.status || 'draft',
        data.reading_time || 1,
        data.seo_title || null,
        data.seo_description || null,
        data.featured ?? false,
        data.published ?? false,
      ]
    );
    return rows[0];
  }

  async update(id, data) {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           category = COALESCE($3, category),
           cover_image = COALESCE($4, cover_image),
           content = COALESCE($5, content),
           excerpt = COALESCE($6, excerpt),
           tags = COALESCE($7::text[], tags),
           status = COALESCE($8, status),
           reading_time = COALESCE($9, reading_time),
           seo_title = COALESCE($10, seo_title),
           seo_description = COALESCE($11, seo_description),
           featured = COALESCE($12, featured),
           published = COALESCE($13, published),
           updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        data.title,
        data.slug,
        data.category,
        data.cover_image,
        data.content,
        data.excerpt,
        data.tags,
        data.status,
        data.reading_time,
        data.seo_title,
        data.seo_description,
        data.featured,
        data.published,
        id,
      ]
    );
    return rows[0] || null;
  }
}

module.exports = BlogRepository;
