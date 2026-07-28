const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, password_hash, created_at FROM admins WHERE email = $1',
    [email]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, created_at FROM admins WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

const create = async ({ name, email, passwordHash }) => {
  const { rows } = await pool.query(
    `INSERT INTO admins (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return rows[0];
};

module.exports = { findByEmail, findById, create };
