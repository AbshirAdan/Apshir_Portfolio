const ApiResponse = require('../utils/ApiResponse');
const HTTP = require('../constants/httpStatus');

/**
 * Placeholder for routes not yet implemented (Phase 3+).
 * Keeps route structure testable without business logic.
 */
const notImplemented = (resource) => (_req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json(
    new ApiResponse(false, `${resource} — implementation planned for Phase 3`)
  );
};

module.exports = notImplemented;
