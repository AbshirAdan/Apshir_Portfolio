const { pool } = require('../config/db');

const findAll = async ({ publishedOnly = false } = {}) => {
  const query = publishedOnly
    ? 'SELECT * FROM blog_posts WHERE published = true ORDER BY published_at DESC NULLS LAST, created_at DESC'
    : 'SELECT * FROM blog_posts ORDER BY created_at DESC';
  const { rows } = await pool.query(query);
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
  return rows[0] || null;
};

const findBySlug = async (slug, publishedOnly = false) => {
  const query = publishedOnly
    ? 'SELECT * FROM blog_posts WHERE slug = $1 AND published = true'
    : 'SELECT * FROM blog_posts WHERE slug = $1';
  const { rows } = await pool.query(query, [slug]);
  return rows[0] || null;
};

const create = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image_url, published, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      data.title, data.slug, data.excerpt || '', data.content || '',
      data.cover_image_url || '', data.published ?? false,
      data.published ? new Date() : null,
    ]
  );
  return rows[0];
};

const update = async (id, data) => {
  const existing = await findById(id);
  if (!existing) return null;

  const published = data.published ?? existing.published;
  const publishedAt = published && !existing.published_at ? new Date() : existing.published_at;

  const { rows } = await pool.query(
    `UPDATE blog_posts SET
      title=$1, slug=$2, excerpt=$3, content=$4, cover_image_url=$5,
      published=$6, published_at=$7, updated_at=CURRENT_TIMESTAMP
     WHERE id=$8 RETURNING *`,
    [
      data.title ?? existing.title,
      data.slug ?? existing.slug,
      data.excerpt ?? existing.excerpt,
      data.content ?? existing.content,
      data.cover_image_url ?? existing.cover_image_url,
      published,
      publishedAt,
      id,
    ]
  );
  return rows[0];
};

const remove = async (id) => {
  const { rows } = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
};

const count = async () => {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM blog_posts');
  return rows[0].count;
};

module.exports = { findAll, findById, findBySlug, create, update, remove, count };
