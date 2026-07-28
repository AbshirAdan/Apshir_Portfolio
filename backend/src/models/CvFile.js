const { pool } = require('../config/db');

const getActive = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM cv_files WHERE is_active = true ORDER BY uploaded_at DESC LIMIT 1'
  );
  return rows[0] || null;
};

const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM cv_files ORDER BY uploaded_at DESC');
  return rows;
};

const create = async (data) => {
  await pool.query('UPDATE cv_files SET is_active = false WHERE is_active = true');
  const { rows } = await pool.query(
    `INSERT INTO cv_files (file_name, file_path, file_size, is_active)
     VALUES ($1,$2,$3,true) RETURNING *`,
    [data.file_name, data.file_path, data.file_size || 0]
  );
  return rows[0];
};

const remove = async (id) => {
  const { rows } = await pool.query('DELETE FROM cv_files WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
};

module.exports = { getActive, findAll, create, remove };
