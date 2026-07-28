const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const config = require('../config');

/**
 * HTTP request logger.
 * Writes access logs to server/logs/access.log in production.
 */
const logDir = config.log.dir;
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);

const requestLogger = config.env === 'production'
  ? morgan('combined', { stream: accessLogStream })
  : morgan('dev');

module.exports = requestLogger;
