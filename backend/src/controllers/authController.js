const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/authService');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(new ApiResponse(true, 'Login successful', result));
});

const getMe = asyncHandler(async (req, res) => {
  const admin = await authService.getMe(req.admin.id);
  res.status(200).json(new ApiResponse(true, 'Admin fetched', admin));
});

module.exports = { login, getMe };
