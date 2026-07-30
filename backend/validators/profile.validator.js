const { body } = require('express-validator');

const updateProfileRules = [
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().trim(),
  body('bio').optional().trim(),
  body('career_objective')
    .optional()
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Career objective must be between 50 and 1000 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('city').optional().trim().isLength({ max: 100 }),
  body('country').optional().trim().isLength({ max: 100 }),
  body('google_map_link').optional().trim().isURL().withMessage('Invalid URL'),
  body('google_map_embed').optional().trim(),
];

module.exports = { updateProfileRules };
