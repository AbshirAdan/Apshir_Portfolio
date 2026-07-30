const ApiError = require('../utils/ApiError');
const HTTP = require('../constants/httpStatus');

/**
 * 404 handler — catches unmatched routes before errorHandler.
 */
const notFound = (req, res, next) => {
  next(new ApiError(HTTP.NOT_FOUND, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
