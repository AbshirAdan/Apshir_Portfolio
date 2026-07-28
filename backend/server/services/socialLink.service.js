const SocialLinkRepository = require('../repositories/socialLink.repository');
const { requireFound } = require('../utils/helpers');

const repo = new SocialLinkRepository();

const getAll = async () => repo.findAll();

const getById = async (id) =>
  requireFound(await repo.findById(id), 'Social link not found');

const create = async (body) => repo.create(body);

const update = async (id, body) =>
  requireFound(await repo.update(id, body), 'Social link not found');

const remove = async (id) =>
  requireFound(await repo.deleteById(id), 'Social link not found');

module.exports = { getAll, getById, create, update, remove };
