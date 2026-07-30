const path = require('path');
const CommunicationRepository = require('../repositories/communication.repository');
const ApiError = require('../utils/ApiError');
const { getPagination, paginatedResponse, requireFound } = require('../utils/helpers');
const { toPublicUrl } = require('../utils/fileUrl');
const HTTP = require('../constants/httpStatus');
const ROLES = require('../constants/roles');
const mailService = require('./mail.service');
const socket = require('../socket');
const config = require('../config');

const repo = new CommunicationRepository();

const serializeAttachment = (a) => ({
  id: a.id,
  message_id: a.message_id,
  file_name: a.file_name,
  file_path: a.file_path,
  file_url: a.file_path,
  file_type: a.file_type,
  file_size: a.file_size,
  created_at: a.created_at,
});

const serializeMessage = (m, attachments = [], reactions = []) => ({
  id: m.id,
  conversation_id: m.conversation_id,
  sender_id: m.sender_id,
  sender_role: m.sender_role,
  sender_name: m.sender_name,
  body: m.body,
  status: m.status,
  delivered_at: m.delivered_at || null,
  seen_at: m.seen_at || null,
  edited_at: m.edited_at,
  deleted_at: m.deleted_at,
  created_at: m.created_at,
  updated_at: m.updated_at,
  attachments: attachments.map(serializeAttachment),
  reactions: summarizeReactions(reactions),
});

const summarizeReactions = (rows = []) => {
  const map = {};
  for (const r of rows) {
    if (!map[r.reaction]) {
      map[r.reaction] = {
        reaction: r.reaction,
        count: 0,
        users: [],
        user_ids: [],
      };
    }
    map[r.reaction].count += 1;
    map[r.reaction].users.push({
      id: r.user_id,
      name: r.user_name || 'User',
    });
    map[r.reaction].user_ids.push(r.user_id);
  }
  return Object.values(map);
};

const serializeConversation = (c) => ({
  id: c.id,
  user_id: c.user_id,
  guest_name: c.user_full_name || c.guest_name,
  guest_email: c.guest_email,
  subject: c.subject,
  status: c.status,
  is_pinned: c.is_pinned,
  last_message_at: c.last_message_at,
  last_message_preview: c.last_message_preview,
  admin_unread_count: c.admin_unread_count,
  user_unread_count: c.user_unread_count,
  avatar: c.user_avatar || null,
  is_online: Boolean(c.is_online),
  last_seen: c.last_seen || null,
  created_at: c.created_at,
  updated_at: c.updated_at,
});

const assertConversationAccess = (conversation, user, asAdmin) => {
  if (asAdmin) return;
  if (!user) throw new ApiError(HTTP.FORBIDDEN, 'Access denied');
  const owns =
    conversation.user_id === user.id ||
    String(conversation.guest_email).toLowerCase() === String(user.email).toLowerCase();
  if (!owns) throw new ApiError(HTTP.FORBIDDEN, 'Access denied');
};

const hydrateMessages = async (messages) => {
  const ids = messages.map((m) => m.id);
  const [attachments, reactions] = await Promise.all([
    repo.getAttachmentsForMessages(ids),
    repo.getReactionsForMessages(ids),
  ]);
  const byMsg = attachments.reduce((acc, a) => {
    (acc[a.message_id] ||= []).push(a);
    return acc;
  }, {});
  const byReact = reactions.reduce((acc, r) => {
    (acc[r.message_id] ||= []).push(r);
    return acc;
  }, {});
  return messages.map((m) => serializeMessage(m, byMsg[m.id] || [], byReact[m.id] || []));
};

const createContactConversation = async (body, user = null, files = []) => {
  const fullName = body.full_name || body.sender_name;
  const email = body.email || body.sender_email;
  const subject = body.subject;
  const message = body.message;

  if (!fullName || !email || !subject || !message) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Full name, email, subject, and message are required');
  }
  if (String(message).length > 3000) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Message must be at most 3000 characters');
  }

  const conversation = await repo.createConversation({
    user_id: user?.id || null,
    guest_name: fullName,
    guest_email: email,
    subject,
    preview: String(message).slice(0, 180),
  });

  const chatMessage = await repo.createMessage({
    conversation_id: conversation.id,
    sender_id: user?.id || null,
    sender_role: user ? 'user' : 'guest',
    sender_name: fullName,
    body: message,
    status: 'delivered',
  });

  const attachments = [];
  for (const file of files || []) {
    const filePath = toPublicUrl('messages', file.filename);
    attachments.push(
      await repo.addAttachment({
        message_id: chatMessage.id,
        file_name: file.originalname,
        file_path: filePath,
        file_type: file.mimetype,
        file_size: file.size,
      })
    );
  }

  const serializedMsg = serializeMessage(chatMessage, attachments);
  const conv = serializeConversation(await repo.findConversationById(conversation.id));

  // Notify admins
  const admins = await repo.findAdminIds();
  for (const admin of admins) {
    await repo.createNotification({
      user_id: admin.id,
      type: 'new_message',
      title: 'New Message',
      body: `${fullName}\n${subject}`,
      conversation_id: conversation.id,
      message_id: chatMessage.id,
      reference_id: conversation.id,
    });
  }

  socket.emitConversationEvent('conversation:new', {
    conversation: conv,
    message: serializedMsg,
  });
  socket.emitToAdmins('notification:new', {
    title: 'New Message',
    body: `${fullName} — ${subject}`,
    type: 'new_message',
    conversationId: conversation.id,
    referenceId: conversation.id,
    browser: {
      title: 'New Message',
      body: `${fullName}\n${subject}`,
      conversationId: conversation.id,
    },
  });

  // Email admins
  for (const admin of admins) {
    mailService.sendNewContactEmail({
      to: admin.email,
      adminName: admin.full_name,
      senderName: fullName,
      senderEmail: email,
      subject,
      message,
    }).catch(() => {});
  }

  return { conversation: conv, message: serializedMsg };
};

const listAdminConversations = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const search = query.search?.trim() || null;
  const status = query.status?.trim() || null;
  const sort = query.sort || 'newest';

  const [items, total, stats] = await Promise.all([
    repo.listConversations({ search, status, sort, limit, offset }),
    repo.countConversationsFiltered({ search, status }),
    repo.getAdminStats(),
  ]);

  return {
    ...paginatedResponse(items.map(serializeConversation), total, page, limit),
    stats: {
      unread: stats.unread || 0,
      read: Math.max(0, (stats.open || 0) - (stats.unread || 0)),
      open: stats.open || 0,
      replied: stats.open || 0,
      archived: stats.archived || 0,
      total: stats.total || 0,
    },
  };
};

const listUserConversations = async (user, query) => {
  const { page, limit, offset } = getPagination(query);
  const search = query.search?.trim() || null;
  const status = query.status?.trim() || null;
  const sort = query.sort || 'newest';

  const filters = {
    search,
    status,
    sort,
    limit,
    offset,
    forUserId: user.id,
    forEmail: user.email,
  };

  const [items, total] = await Promise.all([
    repo.listConversations(filters),
    repo.countConversationsFiltered(filters),
  ]);

  return paginatedResponse(items.map(serializeConversation), total, page, limit);
};

const getConversation = async (id, user, asAdmin = false) => {
  const conversation = requireFound(await repo.findConversationById(id), 'Conversation not found');
  assertConversationAccess(conversation, user, asAdmin);

  let seenRows = [];
  if (asAdmin) {
    seenRows = await repo.markMessagesSeen(id, 'admin');
    await repo.updateConversation(id, { admin_unread_count: 0 });
  } else {
    seenRows = await repo.markMessagesSeen(id, 'user');
    await repo.updateConversation(id, { user_unread_count: 0 });
  }

  const messages = await hydrateMessages(await repo.listMessages(id));
  const fresh = await repo.findConversationById(id);

  if (seenRows.length) {
    const seenPayload = {
      conversationId: id,
      readerRole: asAdmin ? 'admin' : 'user',
      readerId: user.id,
      messageIds: seenRows.map((m) => m.id),
      messages: await hydrateMessages(seenRows),
    };
    socket.emitConversationEvent('message_seen', seenPayload);
    socket.emitConversationEvent('conversation:read', seenPayload);
  }

  return {
    conversation: serializeConversation(fresh),
    messages,
  };
};

const sendReply = async (conversationId, { body }, user, files = [], asAdmin = false) => {
  if (!body || !String(body).trim()) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Message is required');
  }

  const conversation = requireFound(
    await repo.findConversationById(conversationId),
    'Conversation not found'
  );
  assertConversationAccess(conversation, user, asAdmin);

  if (conversation.status === 'archived' && asAdmin) {
    await repo.updateConversation(conversationId, { status: 'open' });
  }

  const chatMessage = await repo.createMessage({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_role: asAdmin ? 'admin' : 'user',
    sender_name: user.full_name || (asAdmin ? 'Admin' : 'User'),
    body: String(body).trim(),
    status: 'sent',
  });

  const attachments = [];
  for (const file of files || []) {
    const filePath = toPublicUrl('messages', file.filename);
    attachments.push(
      await repo.addAttachment({
        message_id: chatMessage.id,
        file_name: file.originalname,
        file_path: filePath,
        file_type: file.mimetype,
        file_size: file.size,
      })
    );
  }

  const preview = String(body).trim().slice(0, 180);
  const updates = {
    last_message_at: new Date().toISOString(),
    last_message_preview: preview,
    status: 'open',
  };

  if (asAdmin) {
    updates.user_unread_count = (conversation.user_unread_count || 0) + 1;
  } else {
    updates.admin_unread_count = (conversation.admin_unread_count || 0) + 1;
  }

  await repo.updateConversation(conversationId, updates);

  // Mark delivered once accepted by server (and bump timestamp)
  const delivered = await repo.markMessageDelivered(chatMessage.id);
  const finalMsg = delivered || chatMessage;

  const serializedMsg = serializeMessage(finalMsg, attachments, []);
  const conv = serializeConversation(await repo.findConversationById(conversationId));

  socket.emitConversationEvent('message:new', {
    conversation: conv,
    message: serializedMsg,
  });
  socket.emitConversationEvent('message:delivered', {
    conversationId,
    message: serializedMsg,
  });

  if (asAdmin) {
    if (conversation.user_id) {
      await repo.createNotification({
        user_id: conversation.user_id,
        type: 'admin_reply',
        title: 'New Reply',
        body: 'You received a reply from Admin.',
        conversation_id: conversationId,
        message_id: chatMessage.id,
        reference_id: conversationId,
      });
      socket.emitToUser(conversation.user_id, 'notification:new', {
        title: 'New Reply',
        body: 'You received a reply from Admin.',
        type: 'admin_reply',
        conversationId,
        referenceId: conversationId,
        browser: {
          title: 'New Reply',
          body: 'You received a reply from Admin.',
          conversationId,
        },
      });
    }

    mailService
      .sendAdminReplyEmail({
        to: conversation.guest_email,
        recipientName: conversation.guest_name,
        originalSubject: conversation.subject,
        adminReply: String(body).trim(),
        portfolioName: 'Abshir Portfolio',
        contactEmail: user.email,
      })
      .catch(() => {});
  } else {
    const admins = await repo.findAdminIds();
    for (const admin of admins) {
      await repo.createNotification({
        user_id: admin.id,
        type: 'user_reply',
        title: 'New Message',
        body: `${conversation.guest_name}\n${conversation.subject}`,
        conversation_id: conversationId,
        message_id: chatMessage.id,
        reference_id: conversationId,
      });
    }
    socket.emitToAdmins('notification:new', {
      title: 'New Message',
      body: `${conversation.guest_name} — ${conversation.subject}`,
      type: 'user_reply',
      conversationId,
      referenceId: conversationId,
      browser: {
        title: 'New Message',
        body: `${conversation.guest_name}\n${conversation.subject}`,
        conversationId,
      },
    });
  }

  return { conversation: conv, message: serializedMsg };
};

const editMessage = async (messageId, { body }, user, asAdmin) => {
  const message = requireFound(await repo.findMessageById(messageId), 'Message not found');
  const conversation = requireFound(
    await repo.findConversationById(message.conversation_id),
    'Conversation not found'
  );
  assertConversationAccess(conversation, user, asAdmin);

  if (message.sender_id !== user.id && !(asAdmin && message.sender_role === 'admin')) {
    throw new ApiError(HTTP.FORBIDDEN, 'You can only edit your own messages');
  }

  const updated = requireFound(
    await repo.updateMessage(messageId, { body: String(body).trim() }),
    'Message not found'
  );
  const [hydrated] = await hydrateMessages([updated]);

  socket.emitConversationEvent('message:updated', {
    conversationId: message.conversation_id,
    message: hydrated,
  });

  return hydrated;
};

const deleteMessage = async (messageId, user, asAdmin) => {
  const message = requireFound(await repo.findMessageById(messageId), 'Message not found');
  const conversation = requireFound(
    await repo.findConversationById(message.conversation_id),
    'Conversation not found'
  );
  assertConversationAccess(conversation, user, asAdmin);

  if (!asAdmin && message.sender_id !== user.id) {
    throw new ApiError(HTTP.FORBIDDEN, 'You can only delete your own messages');
  }

  const updated = requireFound(await repo.softDeleteMessage(messageId), 'Message not found');
  const [hydrated] = await hydrateMessages([updated]);

  socket.emitConversationEvent('message:updated', {
    conversationId: message.conversation_id,
    message: hydrated,
  });

  return hydrated;
};

const archiveConversation = async (id, user, asAdmin) => {
  const conversation = requireFound(await repo.findConversationById(id), 'Conversation not found');
  assertConversationAccess(conversation, user, asAdmin);
  const updated = await repo.updateConversation(id, { status: 'archived' });
  const serialized = serializeConversation({ ...conversation, ...updated });
  socket.emitConversationEvent('conversation:updated', { conversation: serialized });
  return serialized;
};

const setPinned = async (id, isPinned) => {
  const conversation = requireFound(await repo.findConversationById(id), 'Conversation not found');
  const updated = await repo.updateConversation(id, { is_pinned: Boolean(isPinned) });
  const serialized = serializeConversation({ ...conversation, ...updated });
  socket.emitConversationEvent('conversation:updated', { conversation: serialized });
  return serialized;
};

const markConversationUnread = async (id, asAdmin) => {
  const conversation = requireFound(await repo.findConversationById(id), 'Conversation not found');
  const updates = asAdmin ? { admin_unread_count: 1 } : { user_unread_count: 1 };
  const updated = await repo.updateConversation(id, updates);
  return serializeConversation({ ...conversation, ...updated });
};

const deleteConversation = async (id, user, asAdmin) => {
  const conversation = requireFound(await repo.findConversationById(id), 'Conversation not found');
  assertConversationAccess(conversation, user, asAdmin);
  await repo.softDeleteConversation(id);
  socket.emitConversationEvent('conversation:deleted', { conversationId: id });
  return { id };
};

const getNotifications = async (userId) => {
  const [items, unread] = await Promise.all([
    repo.listNotifications(userId),
    repo.countUnreadNotifications(userId),
  ]);
  return {
    items: items.map((n) => ({
      ...n,
      reference_id: n.reference_id || n.conversation_id,
    })),
    unread,
  };
};

const markNotificationRead = async (id, userId) =>
  requireFound(await repo.markNotificationRead(id, userId), 'Notification not found');

const markAllNotificationsRead = async (userId) => {
  await repo.markAllNotificationsRead(userId);
  return { ok: true };
};

const ALLOWED_REACTIONS = new Set(['👍', '❤️', '😂', '🎉', '👏', '🔥', '😮', '😢']);

const toggleReaction = async (messageId, user, reaction, remove = false) => {
  if (!ALLOWED_REACTIONS.has(reaction)) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Invalid reaction');
  }

  const message = requireFound(await repo.findMessageById(messageId), 'Message not found');
  const conversation = requireFound(
    await repo.findConversationById(message.conversation_id),
    'Conversation not found'
  );
  const asAdmin = user.role === ROLES.ADMIN;
  assertConversationAccess(conversation, user, asAdmin);

  if (remove) {
    await repo.removeReaction({ message_id: messageId, user_id: user.id, reaction });
  } else {
    const existing = await repo.getReactionsForMessages([messageId]);
    const already = existing.find(
      (r) => r.user_id === user.id && r.reaction === reaction
    );
    if (already) {
      // Same emoji again → remove (toggle)
      await repo.removeReaction({ message_id: messageId, user_id: user.id, reaction });
    } else {
      await repo.addReaction({ message_id: messageId, user_id: user.id, reaction });
    }
  }

  const fresh = requireFound(await repo.findMessageById(messageId), 'Message not found');
  const [hydrated] = await hydrateMessages([fresh]);
  socket.emitConversationEvent('reaction:update', {
    conversationId: message.conversation_id,
    messageId,
    message: hydrated,
  });
  return hydrated;
};

const addReaction = async (messageId, user, reaction) =>
  toggleReaction(messageId, user, reaction, false);

const removeReaction = async (messageId, user, reaction) =>
  toggleReaction(messageId, user, reaction, true);

module.exports = {
  createContactConversation,
  listAdminConversations,
  listUserConversations,
  getConversation,
  sendReply,
  editMessage,
  deleteMessage,
  archiveConversation,
  setPinned,
  markConversationUnread,
  deleteConversation,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  addReaction,
  removeReaction,
  serializeConversation,
  serializeMessage,
};
