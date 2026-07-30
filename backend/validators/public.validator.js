const { body } = require('express-validator');

const analyticsRules = [
  body('page').trim().notEmpty().withMessage('Page path required'),
  body('browser').optional().trim(),
  body('operating_system').optional().trim(),
  body('country').optional().trim(),
  body('device').optional().trim(),
  body('referrer').optional().trim(),
];

module.exports = { analyticsRules };
