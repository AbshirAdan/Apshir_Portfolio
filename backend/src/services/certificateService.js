const Certificate = require('../models/Certificate');
const ApiError = require('../utils/ApiError');

const getAll = async () => Certificate.findAll();

const getById = async (id) => {
  const cert = await Certificate.findById(id);
  if (!cert) throw new ApiError(404, 'Certificate not found');
  return cert;
};

const create = async (data) => {
  if (!data.title) throw new ApiError(400, 'Title is required');
  return Certificate.create(data);
};

const update = async (id, data) => {
  const cert = await Certificate.update(id, data);
  if (!cert) throw new ApiError(404, 'Certificate not found');
  return cert;
};

const remove = async (id) => {
  const cert = await Certificate.remove(id);
  if (!cert) throw new ApiError(404, 'Certificate not found');
};

module.exports = { getAll, getById, create, update, remove };
