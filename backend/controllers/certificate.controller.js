const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const certificateService = require('../services/certificate.service');
const HTTP = require('../constants/httpStatus');

const getAll = asyncHandler(async (_req, res) => {
  const data = await certificateService.getAll();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Certificates fetched', data));
});

const create = asyncHandler(async (req, res) => {
  const data = await certificateService.create(req.body, req.file);
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Certificate created', data));
});

const update = asyncHandler(async (req, res) => {
  const data = await certificateService.update(req.params.id, req.body, req.file);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Certificate updated', data));
});

const remove = asyncHandler(async (req, res) => {
  await certificateService.remove(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Certificate deleted', null));
});

module.exports = { getAll, create, update, remove };
