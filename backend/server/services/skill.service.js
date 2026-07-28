const SkillRepository = require('../repositories/skill.repository');
const { requireFound } = require('../utils/helpers');

const repo = new SkillRepository();

const getAll = async () => repo.findAll();

const getById = async (id) => requireFound(await repo.findById(id), 'Skill not found');

const create = async (body) => repo.create(body);

const update = async (id, body) =>
  requireFound(await repo.update(id, body), 'Skill not found');

const remove = async (id) =>
  requireFound(await repo.deleteById(id), 'Skill not found');

module.exports = { getAll, getById, create, update, remove };
