const { Pool } = require('pg');
const dbConfig = {
  connectionString: process.env.DATABASE_URL || null,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'newtest',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: (process.env.DATABASE_URL || process.env.DB_SSL === 'true') ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

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
