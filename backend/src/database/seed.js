const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const Admin = require('../models/Admin');

const seed = async () => {
  const existing = await Admin.findByEmail('admin@portfolio.com');
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    await Admin.create({
      name: 'Portfolio Admin',
      email: 'admin@portfolio.com',
      passwordHash,
    });
    console.log('Seeded admin: admin@portfolio.com / admin123');
  }

  const { rows: profileRows } = await pool.query('SELECT id FROM profile LIMIT 1');
  if (profileRows.length === 0) {
    await pool.query(`
      INSERT INTO profile (full_name, title, bio, email, location, github_url, linkedin_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'Your Name',
      'Full Stack Developer',
      'Passionate developer building modern web applications.',
      'hello@example.com',
      'Your City',
      'https://github.com',
      'https://linkedin.com',
    ]);
    console.log('Seeded default profile');
  }

  const { rows: skillRows } = await pool.query('SELECT id FROM skills LIMIT 1');
  if (skillRows.length === 0) {
    const skills = [
      ['React', 'Frontend', 90],
      ['Node.js', 'Backend', 88],
      ['PostgreSQL', 'Database', 85],
      ['TypeScript', 'Frontend', 87],
    ];
    for (let i = 0; i < skills.length; i++) {
      await pool.query(
        'INSERT INTO skills (name, category, proficiency, display_order) VALUES ($1, $2, $3, $4)',
        [...skills[i], i + 1]
      );
    }
    console.log('Seeded sample skills');
  }
};

module.exports = { seed };
