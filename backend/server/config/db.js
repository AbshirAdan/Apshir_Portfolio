const { Pool } = require('pg');
const config = require('./index');

/**
 * PostgreSQL connection pool.
 * All database access must go through this pool (via repositories).
 * Credentials loaded exclusively from environment variables.
 */
const pool = new Pool(config.db);

pool.on('error', (err) => {
  console.error('[DB Pool] Unexpected error:', err.message);
});

const connectDB = async () => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT NOW() AS now, current_database() AS db');
    console.log(`[DB] Connected to "${rows[0].db}" at ${rows[0].now}`);
    return true;
  } finally {
    client.release();
  }
};

module.exports = { pool, connectDB };
