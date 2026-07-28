const { body, param } = require('express-validator');

const socialLinkRules = [
  body('platform').trim().notEmpty().withMessage('Platform required'),
  body('url').trim().isURL().withMessage('Valid URL required'),
  body('icon').optional().trim(),
  body('display_order').optional().isInt({ min: 0 }),
];

const updateSocialLinkRules = [
  param('id').isUUID().withMessage('Invalid social link ID'),
  ...socialLinkRules.map((r) => r.optional()),
];

const socialLinkIdRule = [param('id').isUUID().withMessage('Invalid social link ID')];

module.exports = { socialLinkRules, updateSocialLinkRules, socialLinkIdRule };
