const { pool } = require('../config/db');

const findAll = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM certificates ORDER BY display_order ASC, created_at DESC'
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO certificates (title, issuer, issue_date, credential_url, image_url, display_order)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.title, data.issuer || '', data.issue_date || null, data.credential_url || '', data.image_url || '', data.display_order ?? 0]
  );
  return rows[0];
};

const update = async (id, data) => {
  const existing = await findById(id);
  if (!existing) return null;

  const { rows } = await pool.query(
    `UPDATE certificates SET title=$1, issuer=$2, issue_date=$3, credential_url=$4, image_url=$5, display_order=$6
     WHERE id=$7 RETURNING *`,
    [
      data.title ?? existing.title,
      data.issuer ?? existing.issuer,
      data.issue_date ?? existing.issue_date,
      data.credential_url ?? existing.credential_url,
      data.image_url ?? existing.image_url,
      data.display_order ?? existing.display_order,
      id,
    ]
  );
  return rows[0];
};

const remove = async (id) => {
  const { rows } = await pool.query('DELETE FROM certificates WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
};

const count = async () => {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM certificates');
  return rows[0].count;
};

module.exports = { findAll, findById, create, update, remove, count };
