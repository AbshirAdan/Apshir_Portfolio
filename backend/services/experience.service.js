const ExperienceRepository = require('../repositories/experience.repository');
const { requireFound } = require('../utils/helpers');

const repo = new ExperienceRepository();

const getAll = async (userId) => repo.findAll(userId);

const getById = async (id) =>
  requireFound(await repo.findById(id), 'Experience record not found');

const create = async (userId, body) =>
  repo.create({ ...body, user_id: userId });

const update = async (id, body) =>
  requireFound(await repo.update(id, body), 'Experience record not found');

const remove = async (id) =>
  requireFound(await repo.deleteById(id), 'Experience record not found');

module.exports = { getAll, getById, create, update, remove };
