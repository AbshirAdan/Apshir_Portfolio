const path = require('path');
const MessageRepository = require('../repositories/message.repository');
const ApiError = require('../utils/ApiError');
const { requireFound, getPagination, paginatedResponse } = require('../utils/helpers');
const { toPublicUrl } = require('../utils/fileUrl');
const HTTP = require('../constants/httpStatus');
const MESSAGE_STATUS = require('../constants/messageStatus');
const mailService = require('./mail.service');
const { notifyUserReply, notifyAdminsNewMessage } = require('../socket');
const config = require('../config');

const repo = new MessageRepository();

const serialize = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    sender_id: row.sender_id,
    sender_name: row.full_name,
    sender_email: row.email,
    full_name: row.full_name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status || (row.is_read ? MESSAGE_STATUS.READ : MESSAGE_STATUS.UNREAD),
    is_read: row.is_read,
    reply: row.reply,
    replied_by: row.replied_by,
    replied_at: row.replied_at,
    read_at: row.read_at,
    user_read_at: row.user_read_at,
    attachment: row.attachment,
    created_at: row.created_at,
    updated_at: row.updated_at,
    preview: row.message ? String(row.message).slice(0, 120) : '',
    has_unread_reply:
      row.status === MESSAGE_STATUS.REPLIED &&
      (!row.user_read_at || (row.replied_at && row.user_read_at < row.replied_at)),
  };
};

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const search = query.search?.trim() || null;
  const status = query.status?.trim() || null;
  const sortOrder =
    query.sortOrder ||
    (query.sort === 'oldest' ? 'asc' : query.dateJoined === 'oldest' ? 'asc' : 'desc');

  const [rows, total, counts] = await Promise.all([
    repo.findAll({ search, status, sortOrder, limit, offset }),
    repo.countFiltered({ search, status }),
    repo.countByStatus(),
  ]);

  return {
    ...paginatedResponse(rows.map(serialize), total, page, limit),
    unreadCount: counts.unread,
    stats: counts,
  };
};

const getById = async (id) => {
  const message = requireFound(await repo.findByIdPublic(id), 'Message not found');
  if (message.status === MESSAGE_STATUS.UNREAD) {
    await repo.markRead(id);
    message.status = MESSAGE_STATUS.READ;
    message.is_read = true;
    message.read_at = message.read_at || new Date().toISOString();
  }
  const replies = await repo.getReplies(id);
  return { ...serialize(message), replies };
};

const create = async (body, user = null) => {
  const payload = {
    full_name: body.full_name || body.sender_name,
    email: body.email || body.sender_email,
    subject: body.subject,
    message: body.message,
    sender_id: user?.id || body.sender_id || null,
  };

  if (!payload.full_name || !payload.email || !payload.message) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Full name, email, and message are required');
  }

  if (String(payload.message).length > 3000) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Message must be at most 3000 characters');
  }

  const created = await repo.create(payload);
  const serialized = serialize(created);
  notifyAdminsNewMessage(serialized);
  return serialized;
};

const markRead = async (id) => {
  const updated = requireFound(await repo.markRead(id), 'Message not found');
  return serialize(updated);
};

const archive = async (id) => {
  const updated = requireFound(await repo.setStatus(id, MESSAGE_STATUS.ARCHIVED), 'Message not found');
  return serialize(updated);
};

const remove = async (id) => {
  requireFound(await repo.softDelete(id), 'Message not found');
  return { id };
};

const reply = async (id, { reply }, admin, file) => {
  if (!reply || !String(reply).trim()) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Reply message is required');
  }

  const existing = requireFound(await repo.findByIdPublic(id), 'Message not found');
  const attachment = file ? toPublicUrl('messages', file.filename) : null;

  await repo.addReplyHistory({
    message_id: id,
    admin_id: admin.id,
    body: reply.trim(),
    attachment,
  });

  const updated = requireFound(
    await repo.saveReply(id, {
      reply: reply.trim(),
      replied_by: admin.id,
      attachment,
    }),
    'Message not found'
  );

  const attachmentPath = file
    ? path.join(config.upload.root, 'messages', file.filename)
    : null;

  const emailResult = await mailService.sendAdminReplyEmail({
    to: existing.email,
    recipientName: existing.full_name,
    originalSubject: existing.subject,
    adminReply: reply.trim(),
    portfolioName: 'Portfolio',
    contactEmail: admin.email,
    attachmentPath,
    attachmentName: file?.originalname,
  });

  const serialized = serialize(updated);
  notifyUserReply(serialized);

  return {
    ...serialized,
    replies: await repo.getReplies(id),
    email: emailResult,
  };
};

const getUserMessages = async (user, query) => {
  const { page, limit, offset } = getPagination(query);
  const search = query.search?.trim() || null;
  const status = query.status?.trim() || null;

  const params = {
    senderId: user.id,
    email: user.email,
    search,
    status,
    limit,
    offset,
  };

  const [rows, total, unreadReplies] = await Promise.all([
    repo.findForUser(params),
    repo.countForUser(params),
    repo.countUnreadRepliesForUser({ senderId: user.id, email: user.email }),
  ]);

  return {
    ...paginatedResponse(rows.map(serialize), total, page, limit),
    unreadReplies,
  };
};

const getUserMessageById = async (user, id) => {
  const message = requireFound(
    await repo.findOwnedByUser(id, { senderId: user.id, email: user.email }),
    'Message not found'
  );

  if (
    message.status === MESSAGE_STATUS.REPLIED &&
    (!message.user_read_at || (message.replied_at && message.user_read_at < message.replied_at))
  ) {
    await repo.markUserRead(id);
    message.user_read_at = new Date().toISOString();
  }

  const replies = await repo.getReplies(id);
  return { ...serialize(message), replies };
};

const markUserRead = async (user, id) => {
  requireFound(
    await repo.findOwnedByUser(id, { senderId: user.id, email: user.email }),
    'Message not found'
  );
  const updated = requireFound(await repo.markUserRead(id), 'Message not found');
  return serialize(updated);
};

module.exports = {
  getAll,
  getById,
  create,
  markRead,
  archive,
  remove,
  reply,
  getUserMessages,
  getUserMessageById,
  markUserRead,
  serialize,
};
