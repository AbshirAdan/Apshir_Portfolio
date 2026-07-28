const { body, param } = require('express-validator');

const createBlogRules = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('Title must be between 5 and 150 characters'),
  body('slug').optional().trim().isSlug(),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  body('excerpt').optional().trim(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published']),
  body('reading_time').optional().isInt({ min: 1, max: 120 }),
  body('seo_title').optional().trim().isLength({ max: 150 }),
  body('seo_description').optional().trim().isLength({ max: 300 }),
  body('featured').optional().isBoolean(),
  body('published').optional().isBoolean(),
];

const updateBlogRules = [
  param('id').isUUID().withMessage('Invalid blog ID'),
  body('title').optional().trim().isLength({ min: 5, max: 150 }),
  body('slug').optional().trim().isSlug(),
  body('category').optional().trim().notEmpty(),
  body('content').optional().trim().isLength({ min: 50 }),
  body('excerpt').optional().trim(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published']),
  body('reading_time').optional().isInt({ min: 1, max: 120 }),
  body('seo_title').optional().trim().isLength({ max: 150 }),
  body('seo_description').optional().trim().isLength({ max: 300 }),
  body('featured').optional().isBoolean(),
  body('published').optional().isBoolean(),
];

const blogIdRule = [param('id').isUUID().withMessage('Invalid blog ID')];

module.exports = { createBlogRules, updateBlogRules, blogIdRule };
