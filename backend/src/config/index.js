require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION
      ? (Number.isNaN(Number(process.env.JWT_EXPIRATION))
        ? process.env.JWT_EXPIRATION
        : Number(process.env.JWT_EXPIRATION))
      : '7d',
  },
  upload: {
    dir: path.join(__dirname, '../../uploads'),
    maxFileSize: 5 * 1024 * 1024,
  },
  db: {
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'newtest',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: (process.env.DATABASE_URL || process.env.DB_SSL === 'true') ? { rejectUnauthorized: false } : false,
  },
};
