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

const allowedOrigins = config.frontendUrls;

const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman, Render health checks, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Normalize incoming origin by trimming whitespace and removing trailing slashes
    const normalizedOrigin = origin.trim().replace(/\/$/, '');

    // Validate origin against allowed origins array
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Request origin not allowed: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Preflight response status for compatibility with legacy browsers/clients
}));

// ── Parsing & Logging ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ── Static uploads (not rate-limited — images/CV must load freely) ──
app.use('/uploads', express.static(config.upload.root));

// ── API Routes (rate-limited for abuse protection) ──────────
app.use('/api', rateLimiter, routes);

// ── Error handling ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
