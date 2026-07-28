const { body } = require('express-validator');

const resumeUpdateRules = [
  body('version').optional().trim().isLength({ max: 50 }),
  body('description').optional().trim().isLength({ max: 2000 }),
];

module.exports = { resumeUpdateRules };
