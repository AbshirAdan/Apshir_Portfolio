const ApiError = require('../utils/ApiError');
const HTTP = require('../constants/httpStatus');

/**
 * Centralized error handler — last middleware in the chain.
 * Consistent production error envelope: { success, message, error }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP.INTERNAL_SERVER;
  let message = err.message || 'Internal Server Error';

  if (err.code === '23505') {
    statusCode = HTTP.CONFLICT;
    message = 'Duplicate entry — record already exists';
  }

  if (err.code === '23503') {
    statusCode = HTTP.BAD_REQUEST;
    message = 'Referenced record does not exist';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP.UNAUTHORIZED;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP.UNAUTHORIZED;
    message = 'Token expired';
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = HTTP.BAD_REQUEST;
    message = 'File too large';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = HTTP.BAD_REQUEST;
    message = 'Unexpected file field';
  }

  const errorPayload = err.errors || null;

  const response = {
    success: false,
    message,
    error: errorPayload,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      ...(errorPayload ? {} : { details: err.message }),
    }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
