const { body, param } = require('express-validator');

const createProjectRules = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('slug').optional({ checkFalsy: true }).trim().isSlug().withMessage('Invalid slug format'),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('full_description').trim().notEmpty().withMessage('Description required'),
  body('start_date').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid start date'),
  body('completion_date').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid completion date'),
  body('display_order').optional({ checkFalsy: true }).isInt().withMessage('Display order must be an integer').toInt(),
  body('technologies').optional(),
  body('featured').optional().isBoolean().withMessage('Featured must be boolean'),
];

const updateProjectRules = [
  param('id').isUUID().withMessage('Invalid project ID'),
  ...createProjectRules.map((r) => r.optional()),
];

const projectIdRule = [param('id').isUUID().withMessage('Invalid project ID')];

module.exports = { createProjectRules, updateProjectRules, projectIdRule };
