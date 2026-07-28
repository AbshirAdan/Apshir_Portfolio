const { body } = require('express-validator');

const settingsRules = [
  body('site_title').optional().trim(),
  body('hero_title').optional().trim(),
  body('hero_subtitle').optional().trim(),
  body('hero_description').optional().trim(),
  body('primary_color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid hex color'),
  body('secondary_color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid hex color'),
  body('seo_meta_title').optional().trim(),
  body('seo_description').optional().trim(),
];

module.exports = { settingsRules };
