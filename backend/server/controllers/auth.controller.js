const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const login = asyncHandler(async (req, res) => {
  const result = await authService.signIn(req.body);
  res.status(200).json(new ApiResponse(true, 'Login successful', result));
});

const signIn = asyncHandler(async (req, res) => {
  const result = await authService.signIn(req.body);
  res.status(200).json(new ApiResponse(true, 'Login successful', result));
});

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body, req.file);
  res.status(201).json(new ApiResponse(true, 'Account created successfully', user));
});

const userLogin = asyncHandler(async (req, res) => {
  const result = await authService.signIn(req.body);
  res.status(200).json(new ApiResponse(true, 'Login successful', result));
});

const logout = asyncHandler(async (_req, res) => {
  const result = await authService.logout();
  res.status(200).json(new ApiResponse(true, result.message, null));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json(new ApiResponse(true, 'Profile fetched', user));
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await authService.changePassword(req.user.id, req.body);
  res.status(200).json(new ApiResponse(true, 'Password changed successfully', user));
});

const refreshToken = asyncHandler(async (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : req.body.token;
  const result = await authService.refreshToken(token);
  res.status(200).json(new ApiResponse(true, 'Token refreshed', result));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  res.status(200).json(new ApiResponse(true, result.message, result));
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  res.status(200).json(new ApiResponse(true, result.message, null));
});

module.exports = {
  login,
  signIn,
  register,
  userLogin,
  logout,
  getProfile,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
};
