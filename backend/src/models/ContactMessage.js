const { pool } = require('../config/db');

const findAll = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM contact_messages ORDER BY created_at DESC'
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO contact_messages (name, email, subject, message)
     VALUES ($1,$2,$3,$4) RETURNING id, name, email, subject, message, created_at`,
    [data.name, data.email, data.subject || '', data.message]
  );
  return rows[0];
};

const markRead = async (id) => {
  const { rows } = await pool.query(
    'UPDATE contact_messages SET read = true WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rows } = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
};

const countUnread = async () => {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM contact_messages WHERE read = false'
  );
  return rows[0].count;
};

const count = async () => {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM contact_messages');
  return rows[0].count;
};

module.exports = { findAll, findById, create, markRead, remove, countUnread, count };
