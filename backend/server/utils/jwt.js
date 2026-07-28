/**
 * JWT utilities
 */
const jwt = require('jsonwebtoken');
const config = require('../config');

const signToken = (payload, expiresIn = config.jwt.expiresIn) => {
  if (!config.jwt.secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

const verifyToken = (token) => {
  if (!config.jwt.secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, config.jwt.secret);
};

module.exports = { signToken, verifyToken };
