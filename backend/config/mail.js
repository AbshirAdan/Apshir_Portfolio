module.exports = {
  host: process.env.MAIL_HOST || '',
  port: parseInt(process.env.MAIL_PORT, 10) || 587,
  secure: String(process.env.MAIL_SECURE || '').toLowerCase() === 'true',
  user: process.env.MAIL_AUTH_USER || process.env.MAIL_USER || '',
  password: process.env.MAIL_AUTH_PASSWORD || process.env.MAIL_PASSWORD || '',
  from: process.env.MAIL_FROM || process.env.MAIL_USER || process.env.ADMIN_EMAIL || '',
};
