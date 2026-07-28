const ApiError = require('./ApiError');
const HTTP = require('../constants/httpStatus');

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginatedResponse = (rows, total, page, limit) => ({
  items: rows,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  },
});

const requireFound = (entity, message = 'Resource not found') => {
  if (!entity) throw new ApiError(HTTP.NOT_FOUND, message);
  return entity;
};

module.exports = { getPagination, paginatedResponse, requireFound };
