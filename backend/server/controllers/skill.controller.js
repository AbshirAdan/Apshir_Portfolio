const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const skillService = require('../services/skill.service');
const HTTP = require('../constants/httpStatus');

const getAll = asyncHandler(async (_req, res) => {
  const data = await skillService.getAll();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Skills fetched', data));
});

const create = asyncHandler(async (req, res) => {
  const data = await skillService.create(req.body);
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Skill created', data));
});

const update = asyncHandler(async (req, res) => {
  const data = await skillService.update(req.params.id, req.body);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Skill updated', data));
});

const remove = asyncHandler(async (req, res) => {
  await skillService.remove(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Skill deleted', null));
});

module.exports = { getAll, create, update, remove };
