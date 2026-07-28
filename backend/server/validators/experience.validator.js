const { body, param } = require('express-validator');

const experienceRules = [
  body('company').trim().notEmpty().withMessage('Company required'),
  body('position').optional().trim(),
  body('start_date').optional().isISO8601().withMessage('Invalid start date'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date'),
  body('description').optional().trim(),
];

const updateExperienceRules = [
  param('id').isUUID().withMessage('Invalid experience ID'),
  ...experienceRules.map((r) => r.optional()),
];

const experienceIdRule = [param('id').isUUID().withMessage('Invalid experience ID')];

module.exports = { experienceRules, updateExperienceRules, experienceIdRule };
