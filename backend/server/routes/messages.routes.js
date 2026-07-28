const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { optionalAuth, authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRole = require('../middlewares/authorize.middleware');
const { uploadMessageAttachment } = require('../middlewares/upload.middleware');
const {
  contactRules,
  replyRules,
  messageIdRule,
  listRules,
} = require('../validators/contact.validator');
const messageController = require('../controllers/message.controller');
const ROLES = require('../constants/roles');

const router = express.Router();

// Public / optional-auth contact submission (also mounted at /api/contact)
router.post('/', optionalAuth, validate(contactRules), messageController.create);

// Admin inbox
router.get(
  '/',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  validate(listRules),
  messageController.getAll
);
router.get(
  '/:id',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  validate(messageIdRule),
  messageController.getById
);
router.post(
  '/:id/reply',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  uploadMessageAttachment.single('attachment'),
  validate(replyRules),
  messageController.reply
);
router.patch(
  '/:id/read',
  authenticateToken,
  validate(messageIdRule),
  async (req, res, next) => {
    try {
      if (req.user?.role === ROLES.ADMIN) {
        return messageController.markRead(req, res, next);
      }
      return messageController.markUserRead(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);
router.patch(
  '/:id/archive',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  validate(messageIdRule),
  messageController.archive
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  validate(messageIdRule),
  messageController.remove
);

module.exports = router;
