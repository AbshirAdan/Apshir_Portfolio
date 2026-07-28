const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const blogService = require('../services/blog.service');
const HTTP = require('../constants/httpStatus');

const getAll = asyncHandler(async (req, res) => {
  const data = await blogService.getAll(req.query);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Blogs fetched', data));
});

const getOne = asyncHandler(async (req, res) => {
  const data = await blogService.getByIdOrSlug(req.params.slug);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Blog fetched', data));
});

const create = asyncHandler(async (req, res) => {
  const data = await blogService.create(req.user.id, req.body, req.file);
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Blog created', data));
});

const update = asyncHandler(async (req, res) => {
  const data = await blogService.update(req.params.id, req.body, req.file);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Blog updated', data));
});

const remove = asyncHandler(async (req, res) => {
  await blogService.remove(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Blog deleted', null));
});

module.exports = { getAll, getOne, create, update, remove };
