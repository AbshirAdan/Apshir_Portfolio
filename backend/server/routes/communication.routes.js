const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { optionalAuth, authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRole = require('../middlewares/authorize.middleware');
const { uploadMessageAttachment } = require('../middlewares/upload.middleware');
const { contactRules, listRules, messageBodyRules, reactionRules } = require('../validators/communication.validator');
const ctrl = require('../controllers/communication.controller');
const ROLES = require('../constants/roles');

const router = express.Router();

// Public contact → creates conversation
router.post(
  '/contact',
  optionalAuth,
  uploadMessageAttachment.array('attachments', 5),
  validate(contactRules),
  ctrl.createContact
);

// Admin Communication Center
router.get(
  '/admin/conversations',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  validate(listRules),
  ctrl.listAdminConversations
);
router.get(
  '/admin/conversations/:id',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  ctrl.getAdminConversation
);
router.post(
  '/admin/conversations/:id/messages',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  uploadMessageAttachment.array('attachments', 5),
  validate(messageBodyRules),
  ctrl.sendAdminMessage
);
router.patch(
  '/admin/conversations/:id/archive',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  ctrl.archiveConversation
);
router.patch(
  '/admin/conversations/:id/pin',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  ctrl.pinConversation
);
router.patch(
  '/admin/conversations/:id/unpin',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  ctrl.unpinConversation
);
router.patch(
  '/admin/conversations/:id/unread',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  ctrl.markUnread
);
router.delete(
  '/admin/conversations/:id',
  authenticateToken,
  authorizeRole(ROLES.ADMIN),
  ctrl.deleteConversation
);

// User conversations
router.get('/user/conversations', authenticateToken, validate(listRules), ctrl.listUserConversations);
router.get('/user/conversations/:id', authenticateToken, ctrl.getUserConversation);
router.post(
  '/user/conversations/:id/messages',
  authenticateToken,
  uploadMessageAttachment.array('attachments', 5),
  validate(messageBodyRules),
  ctrl.sendUserMessage
);
router.delete('/user/conversations/:id', authenticateToken, ctrl.deleteConversation);

// Shared message edit/delete
router.patch(
  '/messages/:messageId',
  authenticateToken,
  validate(messageBodyRules),
  ctrl.editMessage
);
router.delete('/messages/:messageId', authenticateToken, ctrl.deleteMessage);

// Message reactions
router.post(
  '/messages/:id/reaction',
  authenticateToken,
  validate(reactionRules),
  ctrl.addReaction
);
router.delete(
  '/messages/:id/reaction',
  authenticateToken,
  validate(reactionRules),
  ctrl.removeReaction
);

// Notifications
router.get('/notifications', authenticateToken, ctrl.getNotifications);
router.patch('/notifications/read-all', authenticateToken, ctrl.markAllNotificationsRead);
router.patch('/notifications/read', authenticateToken, ctrl.markNotificationsRead);
router.patch('/notifications/:id/read', authenticateToken, ctrl.markNotificationRead);

module.exports = router;
