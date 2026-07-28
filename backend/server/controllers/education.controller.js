const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const educationService = require('../services/education.service');
const HTTP = require('../constants/httpStatus');

const getAll = asyncHandler(async (req, res) => {
  const data = await educationService.getAll(req.user.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Education records fetched', data));
});

const create = asyncHandler(async (req, res) => {
  const data = await educationService.create(req.user.id, req.body);
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Education record created', data));
});

const update = asyncHandler(async (req, res) => {
  const data = await educationService.update(req.params.id, req.body);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Education record updated', data));
});

const remove = asyncHandler(async (req, res) => {
  await educationService.remove(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Education record deleted', null));
});

module.exports = { getAll, create, update, remove };
