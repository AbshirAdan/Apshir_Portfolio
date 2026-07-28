const Skill = require('../models/Skill');
const ApiError = require('../utils/ApiError');

const getAll = async () => Skill.findAll();

const create = async (data) => {
  if (!data.name) throw new ApiError(400, 'Skill name is required');
  return Skill.create(data);
};

const update = async (id, data) => {
  const skill = await Skill.update(id, data);
  if (!skill) throw new ApiError(404, 'Skill not found');
  return skill;
};

const remove = async (id) => {
  const skill = await Skill.remove(id);
  if (!skill) throw new ApiError(404, 'Skill not found');
};

module.exports = { getAll, create, update, remove };
