const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const communicationService = require('../services/communication.service');
const HTTP = require('../constants/httpStatus');
const ROLES = require('../constants/roles');

const createContact = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);
  const data = await communicationService.createContactConversation(
    req.body,
    req.user || null,
    files
  );
  res
    .status(HTTP.CREATED)
    .json(new ApiResponse(true, 'Your message has been sent successfully.', data));
});

const listAdminConversations = asyncHandler(async (req, res) => {
  const data = await communicationService.listAdminConversations(req.query);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Conversations fetched', data));
});

const listUserConversations = asyncHandler(async (req, res) => {
  const data = await communicationService.listUserConversations(req.user, req.query);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Conversations fetched', data));
});

const getConversation = asyncHandler(async (req, res) => {
  const asAdmin = req.user?.role === ROLES.ADMIN && req.baseUrl.includes('/admin');
  const data = await communicationService.getConversation(req.params.id, req.user, asAdmin);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Conversation fetched', data));
});

const getAdminConversation = asyncHandler(async (req, res) => {
  const data = await communicationService.getConversation(req.params.id, req.user, true);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Conversation fetched', data));
});

const getUserConversation = asyncHandler(async (req, res) => {
  const data = await communicationService.getConversation(req.params.id, req.user, false);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Conversation fetched', data));
});

const sendAdminMessage = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);
  const data = await communicationService.sendReply(
    req.params.id,
    { body: req.body.body || req.body.message || req.body.reply },
    req.user,
    files,
    true
  );
  res.status(HTTP.OK).json(new ApiResponse(true, 'Message sent', data));
});

const sendUserMessage = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);
  const data = await communicationService.sendReply(
    req.params.id,
    { body: req.body.body || req.body.message || req.body.reply },
    req.user,
    files,
    false
  );
  res.status(HTTP.OK).json(new ApiResponse(true, 'Message sent', data));
});

const editMessage = asyncHandler(async (req, res) => {
  const asAdmin = req.user?.role === ROLES.ADMIN;
  const data = await communicationService.editMessage(
    req.params.messageId,
    { body: req.body.body || req.body.message },
    req.user,
    asAdmin
  );
  res.status(HTTP.OK).json(new ApiResponse(true, 'Message updated', data));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const asAdmin = req.user?.role === ROLES.ADMIN;
  const data = await communicationService.deleteMessage(req.params.messageId, req.user, asAdmin);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Message deleted', data));
});

const archiveConversation = asyncHandler(async (req, res) => {
  const asAdmin = req.user?.role === ROLES.ADMIN;
  const data = await communicationService.archiveConversation(req.params.id, req.user, asAdmin);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Conversation archived', data));
});

const pinConversation = asyncHandler(async (req, res) => {
  const data = await communicationService.setPinned(req.params.id, req.body.pinned !== false);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Conversation pinned', data));
});

const unpinConversation = asyncHandler(async (req, res) => {
  const data = await communicationService.setPinned(req.params.id, false);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Conversation unpinned', data));
});

const markUnread = asyncHandler(async (req, res) => {
  const asAdmin = req.user?.role === ROLES.ADMIN;
  const data = await communicationService.markConversationUnread(req.params.id, asAdmin);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Marked unread', data));
});

const deleteConversation = asyncHandler(async (req, res) => {
  const asAdmin = req.user?.role === ROLES.ADMIN;
  const data = await communicationService.deleteConversation(req.params.id, req.user, asAdmin);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Conversation deleted', data));
});

const getNotifications = asyncHandler(async (req, res) => {
  const data = await communicationService.getNotifications(req.user.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Notifications fetched', data));
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const data = await communicationService.markNotificationRead(req.params.id, req.user.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Notification read', data));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const data = await communicationService.markAllNotificationsRead(req.user.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'All notifications read', data));
});

const markNotificationsRead = asyncHandler(async (req, res) => {
  // Supports PATCH /notifications/read with { id } or { ids: [] }
  const id = req.body?.id || req.params?.id;
  const ids = req.body?.ids;
  if (Array.isArray(ids) && ids.length) {
    for (const nid of ids) {
      await communicationService.markNotificationRead(nid, req.user.id);
    }
    return res.status(HTTP.OK).json(new ApiResponse(true, 'Notifications read', { ok: true }));
  }
  if (!id) {
    await communicationService.markAllNotificationsRead(req.user.id);
    return res.status(HTTP.OK).json(new ApiResponse(true, 'All notifications read', { ok: true }));
  }
  const data = await communicationService.markNotificationRead(id, req.user.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Notification read', data));
});

const addReaction = asyncHandler(async (req, res) => {
  const data = await communicationService.addReaction(
    req.params.id || req.params.messageId,
    req.user,
    req.body.reaction
  );
  res.status(HTTP.OK).json(new ApiResponse(true, 'Reaction updated', data));
});

const removeReaction = asyncHandler(async (req, res) => {
  const data = await communicationService.removeReaction(
    req.params.id || req.params.messageId,
    req.user,
    req.body.reaction || req.query.reaction
  );
  res.status(HTTP.OK).json(new ApiResponse(true, 'Reaction removed', data));
});

module.exports = {
  createContact,
  listAdminConversations,
  listUserConversations,
  getConversation,
  getAdminConversation,
  getUserConversation,
  sendAdminMessage,
  sendUserMessage,
  editMessage,
  deleteMessage,
  archiveConversation,
  pinConversation,
  unpinConversation,
  markUnread,
  deleteConversation,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  markNotificationsRead,
  addReaction,
  removeReaction,
};
