const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const HTTP = require('../constants/httpStatus');

/**
 * Runs express-validator rules and returns 422 on failure.
 * Usage: router.post('/', validate(rules), handler)
 */
const validate = (rules) => async (req, res, next) => {
  await Promise.all(rules.map((rule) => rule.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ApiError(HTTP.UNPROCESSABLE, 'Validation failed', formatted));
  }

  next();
};

module.exports = validate;
