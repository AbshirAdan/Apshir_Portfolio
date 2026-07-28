const { pool } = require('../config/db');

const get = async () => {
  const { rows } = await pool.query('SELECT * FROM profile ORDER BY id ASC LIMIT 1');
  return rows[0] || null;
};

const update = async (data) => {
  const existing = await get();
  const fields = [
    'full_name', 'title', 'bio', 'avatar_url', 'email', 'phone',
    'location', 'github_url', 'linkedin_url', 'twitter_url', 'website_url',
  ];

  if (!existing) {
    const { rows } = await pool.query(
      `INSERT INTO profile (full_name, title, bio, avatar_url, email, phone, location, github_url, linkedin_url, twitter_url, website_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      fields.map((f) => data[f] ?? '')
    );
    return rows[0];
  }

  const values = fields.map((f) => data[f] ?? existing[f]);
  const { rows } = await pool.query(
    `UPDATE profile SET
      full_name=$1, title=$2, bio=$3, avatar_url=$4, email=$5, phone=$6,
      location=$7, github_url=$8, linkedin_url=$9, twitter_url=$10, website_url=$11,
      updated_at=CURRENT_TIMESTAMP
     WHERE id=$12 RETURNING *`,
    [...values, existing.id]
  );
  return rows[0];
};

module.exports = { get, update };
