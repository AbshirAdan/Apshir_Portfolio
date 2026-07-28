const { pool } = require('../config/db');

const findAll = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM skills ORDER BY display_order ASC, id ASC'
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM skills WHERE id = $1', [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO skills (name, category, proficiency, display_order)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.name, data.category || 'General', data.proficiency ?? 80, data.display_order ?? 0]
  );
  return rows[0];
};

const update = async (id, data) => {
  const { rows } = await pool.query(
    `UPDATE skills SET
      name = COALESCE($1, name),
      category = COALESCE($2, category),
      proficiency = COALESCE($3, proficiency),
      display_order = COALESCE($4, display_order)
     WHERE id = $5 RETURNING *`,
    [data.name, data.category, data.proficiency, data.display_order, id]
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rows } = await pool.query('DELETE FROM skills WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
};

module.exports = { findAll, findById, create, update, remove };
