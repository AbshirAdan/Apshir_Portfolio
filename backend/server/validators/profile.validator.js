const { body } = require('express-validator');

const updateProfileRules = [
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().trim(),
  body('bio').optional().trim(),
];

module.exports = { updateProfileRules };
