const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const experienceService = require('../services/experience.service');
const HTTP = require('../constants/httpStatus');

const getAll = asyncHandler(async (req, res) => {
  const data = await experienceService.getAll(req.user.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Experience records fetched', data));
});

const create = asyncHandler(async (req, res) => {
  const data = await experienceService.create(req.user.id, req.body);
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Experience record created', data));
});

const update = asyncHandler(async (req, res) => {
  const data = await experienceService.update(req.params.id, req.body);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Experience record updated', data));
});

const remove = asyncHandler(async (req, res) => {
  await experienceService.remove(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Experience record deleted', null));
});

module.exports = { getAll, create, update, remove };
