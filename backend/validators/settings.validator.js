const { body } = require('express-validator');

const settingsRules = [
  body('site_title').optional().trim(),
  body('hero_greeting').notEmpty().withMessage('Hero greeting is required').isLength({ max: 120 }).withMessage('Maximum 120 characters').trim(),
  body('hero_title').notEmpty().withMessage('Hero title is required').isLength({ max: 150 }).withMessage('Maximum 150 characters').trim(),
  body('hero_subtitle').optional().trim(),
  body('hero_description').optional().trim(),
  body('primary_color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid hex color'),
  body('secondary_color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid hex color'),
  body('seo_meta_title').optional().trim(),
  body('seo_description').optional().trim(),
];

module.exports = { settingsRules };
