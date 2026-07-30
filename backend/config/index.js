require('dotenv').config();
const path = require('path');
const mailConfig = require('./mail');
const uploadConfig = require('./upload');
const socketConfig = require('./socket');

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/$/, ''),
  frontendUrls: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, '')),
  apiUrl: process.env.API_URL || `http://localhost:${parseInt(process.env.PORT, 10) || 5000}/api`,

  adminSeed: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
    fullName: process.env.ADMIN_FULL_NAME || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },

  mail: mailConfig,
  upload: uploadConfig,
  socket: socketConfig,

  rateLimit: {
    // Global API: up to 10,000 requests per IP per minute (high traffic friendly)
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 10000,
    // Auth (login): tighter to block brute-force
    authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 30,
  },

  log: {
    dir: path.join(__dirname, '../logs'),
  },
};
