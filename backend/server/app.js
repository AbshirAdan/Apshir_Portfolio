const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');
const requestLogger = require('./middlewares/logger.middleware');
const { rateLimiter } = require('./middlewares/rateLimiter.middleware');
const { ensureDir } = require('./middlewares/upload.middleware');

// Ensure upload & log directories exist
['images', 'projects', 'blogs', 'resumes', 'certificates', 'avatars', 'logos', 'messages'].forEach((dir) => {
  ensureDir(path.join(config.upload.root, dir));
});

const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));

// ── Parsing & Logging ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ── Static uploads (not rate-limited — images/CV must load freely) ──
// Legacy uploads (backend/uploads) checked first, then active server/uploads store
const legacyUploadsRoot = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(legacyUploadsRoot));
app.use('/uploads', express.static(config.upload.root));

// ── API Routes (rate-limited for abuse protection) ──────────
app.use('/api', rateLimiter, routes);

// ── Error handling ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
