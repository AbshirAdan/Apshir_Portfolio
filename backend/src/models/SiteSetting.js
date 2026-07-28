const { pool } = require('../config/db');

const getAll = async () => {
  const { rows } = await pool.query('SELECT key, value FROM site_settings');
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
};

const set = async (key, value) => {
  const { rows } = await pool.query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [key, value]
  );
  return rows[0];
};

const setMany = async (settings) => {
  const results = [];
  for (const [key, value] of Object.entries(settings)) {
    results.push(await set(key, value));
  }
  return results;
};

module.exports = { getAll, set, setMany };
