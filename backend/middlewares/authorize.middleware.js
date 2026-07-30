const ApiError = require('../utils/ApiError');
const HTTP = require('../constants/httpStatus');

/**
 * Role-based authorization middleware.
 * Usage: authorizeRole('admin')
 */
const authorizeRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(HTTP.UNAUTHORIZED, 'Authentication required'));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(HTTP.FORBIDDEN, 'Access denied — insufficient permissions'));
  }

  next();
};

module.exports = authorizeRole;
