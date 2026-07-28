const EducationRepository = require('../repositories/education.repository');
const { requireFound } = require('../utils/helpers');

const repo = new EducationRepository();

const getAll = async (userId) => repo.findAll(userId);

const getById = async (id) =>
  requireFound(await repo.findById(id), 'Education record not found');

const create = async (userId, body) =>
  repo.create({ ...body, user_id: userId });

const update = async (id, body) =>
  requireFound(await repo.update(id, body), 'Education record not found');

const remove = async (id) =>
  requireFound(await repo.deleteById(id), 'Education record not found');

module.exports = { getAll, getById, create, update, remove };
