const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const dashboardService = require('../services/dashboard.service');
const HTTP = require('../constants/httpStatus');

const getStats = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getStats();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Dashboard stats fetched', data));
});

const getActivity = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getRecentActivity();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Recent activity fetched', data));
});

module.exports = { getStats, getActivity };
