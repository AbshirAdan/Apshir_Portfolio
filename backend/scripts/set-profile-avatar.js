require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../server/config/db');

const AVATAR = '/uploads/images/my protofilo.png';

(async () => {
  const { rows } = await pool.query(
    `UPDATE users SET avatar = $1, updated_at = NOW()
     WHERE role = 'admin'
     RETURNING email, avatar`,
    [AVATAR]
  );
  rows.forEach((r) => console.log(`Updated: ${r.email} → ${r.avatar}`));
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
