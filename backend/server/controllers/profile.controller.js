const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const profileService = require('../services/profile.service');
const HTTP = require('../constants/httpStatus');

const getProfile = asyncHandler(async (req, res) => {
  const data = await profileService.getProfile(req.user.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Profile fetched', data));
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await profileService.updateProfile(req.user.id, req.body);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Profile updated', data));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const data = await profileService.updateAvatar(req.user.id, req.file);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Avatar updated', data));
});

module.exports = { getProfile, updateProfile, updateAvatar };
