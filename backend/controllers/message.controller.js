const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const messageService = require('../services/message.service');
const HTTP = require('../constants/httpStatus');

const getAll = asyncHandler(async (req, res) => {
  const data = await messageService.getAll(req.query);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Messages fetched', data));
});

const getById = asyncHandler(async (req, res) => {
  const data = await messageService.getById(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Message fetched', data));
});

const create = asyncHandler(async (req, res) => {
  const data = await messageService.create(req.body, req.user || null);
  res.status(HTTP.CREATED).json(
    new ApiResponse(true, 'Your message has been sent successfully.', data)
  );
});

const markRead = asyncHandler(async (req, res) => {
  const data = await messageService.markRead(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Message marked as read', data));
});

const archive = asyncHandler(async (req, res) => {
  const data = await messageService.archive(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Message archived', data));
});

const remove = asyncHandler(async (req, res) => {
  await messageService.remove(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Message deleted', null));
});

const reply = asyncHandler(async (req, res) => {
  const data = await messageService.reply(req.params.id, req.body, req.user, req.file);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Reply sent successfully', data));
});

const getUserMessages = asyncHandler(async (req, res) => {
  const data = await messageService.getUserMessages(req.user, req.query);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Messages fetched', data));
});

const getUserMessageById = asyncHandler(async (req, res) => {
  const data = await messageService.getUserMessageById(req.user, req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Message fetched', data));
});

const markUserRead = asyncHandler(async (req, res) => {
  const data = await messageService.markUserRead(req.user, req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Reply marked as read', data));
});

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
};
