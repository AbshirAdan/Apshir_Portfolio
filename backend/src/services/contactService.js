const ContactMessage = require('../models/ContactMessage');
const ApiError = require('../utils/ApiError');

const getAll = async () => ContactMessage.findAll();

const create = async (data) => {
  if (!data.name || !data.email || !data.message) {
    throw new ApiError(400, 'Name, email, and message are required');
  }
  return ContactMessage.create(data);
};

const markRead = async (id) => {
  const msg = await ContactMessage.markRead(id);
  if (!msg) throw new ApiError(404, 'Message not found');
  return msg;
};

const remove = async (id) => {
  const msg = await ContactMessage.remove(id);
  if (!msg) throw new ApiError(404, 'Message not found');
};

module.exports = { getAll, create, markRead, remove };
