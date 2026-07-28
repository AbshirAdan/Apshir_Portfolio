const { pool } = require('../server/config/db');

async function main() {
  const migrations = await pool.query('SELECT filename FROM schema_migrations ORDER BY filename');
  console.log('migrations:', migrations.rows);

  const cols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
  );
  console.log('users columns:', cols.rows.map((r) => r.column_name));

  const check = await pool.query(
    `SELECT conname, pg_get_constraintdef(c.oid) AS def
     FROM pg_constraint c
     JOIN pg_class t ON c.conrelid = t.oid
     WHERE t.relname = 'users' AND c.contype = 'c'`
  );
  console.log('checks:', check.rows);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
