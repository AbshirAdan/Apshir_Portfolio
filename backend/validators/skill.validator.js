const { body, param } = require('express-validator');

const createSkillRules = [
  body('name').trim().notEmpty().withMessage('Skill name required'),
  body('percentage').isInt({ min: 0, max: 100 }).withMessage('Percentage must be 0–100'),
  body('category').optional().trim(),
  body('display_order').optional().isInt({ min: 0 }),
];

const updateSkillRules = [
  param('id').isUUID().withMessage('Invalid skill ID'),
  body('name').optional().trim().notEmpty(),
  body('percentage').optional().isInt({ min: 0, max: 100 }),
  body('category').optional().trim(),
  body('display_order').optional().isInt({ min: 0 }),
];

const skillIdRule = [param('id').isUUID().withMessage('Invalid skill ID')];

module.exports = { createSkillRules, updateSkillRules, skillIdRule };
