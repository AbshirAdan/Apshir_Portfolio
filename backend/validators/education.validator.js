const { body, param } = require('express-validator');

const educationRules = [
  body('school').trim().notEmpty().withMessage('School required'),
  body('degree').optional().trim(),
  body('field').optional().trim(),
  body('start_date').optional().isISO8601().withMessage('Invalid start date'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date'),
];

const updateEducationRules = [
  param('id').isUUID().withMessage('Invalid education ID'),
  ...educationRules.map((r) => r.optional()),
];

const educationIdRule = [param('id').isUUID().withMessage('Invalid education ID')];

module.exports = { educationRules, updateEducationRules, educationIdRule };
