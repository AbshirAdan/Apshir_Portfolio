const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const settingsService = require('../services/settings.service');
const HTTP = require('../constants/httpStatus');

const get = asyncHandler(async (_req, res) => {
  const data = await settingsService.get();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Settings fetched', data));
});

const upsert = asyncHandler(async (req, res) => {
  const data = await settingsService.upsert(req.body, req.files);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Settings updated', data));
});

module.exports = { get, upsert };
