/**
 * Custom application error with HTTP status code.
 * Throw from services; caught by centralized errorHandler.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    if (errors) this.errors = errors;
  }
}

module.exports = ApiError;
