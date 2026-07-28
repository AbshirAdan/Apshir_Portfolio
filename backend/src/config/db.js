const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool(config.db);

const connectDB = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log(`PostgreSQL connected to database "${config.db.database}"`);
  } finally {
    client.release();
  }
};

module.exports = { pool, connectDB };
