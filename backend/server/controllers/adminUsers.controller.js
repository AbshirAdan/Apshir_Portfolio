const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const adminUsersService = require('../services/adminUsers.service');
const HTTP = require('../constants/httpStatus');

const listUsers = asyncHandler(async (req, res) => {
  const data = await adminUsersService.listUsers(req.query);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Users fetched', data));
});

const getUser = asyncHandler(async (req, res) => {
  const data = await adminUsersService.getUserById(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'User fetched', data));
});

const updateUser = asyncHandler(async (req, res) => {
  const data = await adminUsersService.updateUser(req.params.id, req.body, req.user.id, req.file);
  res.status(HTTP.OK).json(new ApiResponse(true, 'User updated', data));
});

const deleteUser = asyncHandler(async (req, res) => {
  const data = await adminUsersService.deleteUser(req.params.id, req.user.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'User deleted', data));
});

const updateStatus = asyncHandler(async (req, res) => {
  const data = await adminUsersService.updateStatus(req.params.id, req.body.status, req.user.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'User status updated', data));
});

const updateRole = asyncHandler(async (req, res) => {
  const data = await adminUsersService.updateRole(req.params.id, req.body.role, req.user.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'User role updated', data));
});

module.exports = {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  updateStatus,
  updateRole,
};
