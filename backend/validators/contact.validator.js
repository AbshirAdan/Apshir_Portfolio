const { body, param, query } = require('express-validator');
const MESSAGE_STATUS = require('../constants/messageStatus');

const contactRules = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ max: 255 }),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 255 }),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 3000 }).withMessage('Message must be at most 3000 characters'),
];

const replyRules = [
  param('id').isUUID().withMessage('Valid message id required'),
  body('reply')
    .trim()
    .notEmpty().withMessage('Reply is required')
    .isLength({ max: 5000 }).withMessage('Reply must be at most 5000 characters'),
];

const messageIdRule = [param('id').isUUID().withMessage('Valid message id required')];

const listRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ max: 255 }),
  query('status')
    .optional()
    .isIn([
      MESSAGE_STATUS.UNREAD,
      MESSAGE_STATUS.READ,
      MESSAGE_STATUS.REPLIED,
      MESSAGE_STATUS.ARCHIVED,
      'unread_replies',
      'read_replies',
    ]),
  query('sort').optional().isIn(['newest', 'oldest']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

module.exports = {
  contactRules,
  replyRules,
  messageIdRule,
  listRules,
};
