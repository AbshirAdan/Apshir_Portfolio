const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Global API rate limiter — per IP.
 * Default: 10,000 requests / minute so high legitimate traffic is allowed.
 * Auth routes use a stricter limiter separately.
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Health checks and static assets must never count toward the quota
    const path = req.path || '';
    return (
      path.startsWith('/health') ||
      path.startsWith('/uploads') ||
      req.originalUrl?.startsWith('/uploads')
    );
  },
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    error: null,
  },
});

/**
 * Stricter limiter for auth routes — blocks credential stuffing / brute force.
 * 30 attempts per 15 minutes per IP.
 */
const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    error: null,
  },
});

module.exports = { rateLimiter, authRateLimiter };
