const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const socialLinkService = require('../services/socialLink.service');
const HTTP = require('../constants/httpStatus');

const getAll = asyncHandler(async (_req, res) => {
  const data = await socialLinkService.getAll();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Social links fetched', data));
});

const create = asyncHandler(async (req, res) => {
  const data = await socialLinkService.create(req.body);
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Social link created', data));
});

const update = asyncHandler(async (req, res) => {
  const data = await socialLinkService.update(req.params.id, req.body);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Social link updated', data));
});

const remove = asyncHandler(async (req, res) => {
  await socialLinkService.remove(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Social link deleted', null));
});

module.exports = { getAll, create, update, remove };
