const { body, query } = require('express-validator');

const ALLOWED_REACTIONS = ['👍', '❤️', '😂', '🎉', '👏', '🔥', '😮', '😢'];

const contactRules = [
  body('full_name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 255 }),
  body('email').trim().notEmpty().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 255 }),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 3000 }).withMessage('Message must be at most 3000 characters'),
];

const messageBodyRules = [
  body('body').optional().trim().isLength({ max: 5000 }),
  body('message').optional().trim().isLength({ max: 5000 }),
  body('reply').optional().trim().isLength({ max: 5000 }),
  body().custom((_, { req }) => {
    const text = req.body.body || req.body.message || req.body.reply;
    if (!text || !String(text).trim()) {
      throw new Error('Message body is required');
    }
    return true;
  }),
];

const listRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ max: 255 }),
  query('status').optional().isIn(['open', 'unread', 'read', 'archived']),
  query('sort').optional().isIn(['newest', 'oldest']),
];

const reactionRules = [
  body('reaction')
    .optional()
    .trim()
    .isIn(ALLOWED_REACTIONS)
    .withMessage('Invalid reaction'),
  query('reaction')
    .optional()
    .trim()
    .isIn(ALLOWED_REACTIONS)
    .withMessage('Invalid reaction'),
  body().custom((_, { req }) => {
    const reaction = req.body?.reaction || req.query?.reaction;
    if (!reaction || !ALLOWED_REACTIONS.includes(reaction)) {
      throw new Error('Valid reaction is required');
    }
    // Normalize onto body for controller
    req.body = req.body || {};
    req.body.reaction = reaction;
    return true;
  }),
];

module.exports = { contactRules, messageBodyRules, listRules, reactionRules, ALLOWED_REACTIONS };
