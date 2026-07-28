const { pool } = require('../config/db');

const findAll = async ({ publishedOnly = false } = {}) => {
  const query = publishedOnly
    ? 'SELECT * FROM projects WHERE published = true ORDER BY display_order ASC, created_at DESC'
    : 'SELECT * FROM projects ORDER BY display_order ASC, created_at DESC';
  const { rows } = await pool.query(query);
  return rows;
};

const findFeatured = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM projects WHERE published = true AND featured = true ORDER BY display_order ASC LIMIT 6'
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  return rows[0] || null;
};

const findBySlug = async (slug, publishedOnly = false) => {
  const query = publishedOnly
    ? 'SELECT * FROM projects WHERE slug = $1 AND published = true'
    : 'SELECT * FROM projects WHERE slug = $1';
  const { rows } = await pool.query(query, [slug]);
  return rows[0] || null;
};

const create = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO projects (title, slug, description, long_description, image_url, demo_url, github_url, tech_stack, featured, published, display_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      data.title, data.slug, data.description || '', data.long_description || '',
      data.image_url || '', data.demo_url || '', data.github_url || '',
      JSON.stringify(data.tech_stack || []), data.featured ?? false,
      data.published ?? true, data.display_order ?? 0,
    ]
  );
  return rows[0];
};

const update = async (id, data) => {
  const existing = await findById(id);
  if (!existing) return null;

  const { rows } = await pool.query(
    `UPDATE projects SET
      title=$1, slug=$2, description=$3, long_description=$4, image_url=$5,
      demo_url=$6, github_url=$7, tech_stack=$8, featured=$9, published=$10,
      display_order=$11, updated_at=CURRENT_TIMESTAMP
     WHERE id=$12 RETURNING *`,
    [
      data.title ?? existing.title,
      data.slug ?? existing.slug,
      data.description ?? existing.description,
      data.long_description ?? existing.long_description,
      data.image_url ?? existing.image_url,
      data.demo_url ?? existing.demo_url,
      data.github_url ?? existing.github_url,
      JSON.stringify(data.tech_stack ?? existing.tech_stack),
      data.featured ?? existing.featured,
      data.published ?? existing.published,
      data.display_order ?? existing.display_order,
      id,
    ]
  );
  return rows[0];
};

const remove = async (id) => {
  const { rows } = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
};

const count = async () => {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM projects');
  return rows[0].count;
};

module.exports = { findAll, findFeatured, findById, findBySlug, create, update, remove, count };
