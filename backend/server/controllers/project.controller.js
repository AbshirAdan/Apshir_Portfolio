const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const projectService = require('../services/project.service');
const HTTP = require('../constants/httpStatus');

const getAll = asyncHandler(async (req, res) => {
  const data = await projectService.getAll(req.query);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Projects fetched', data));
});

const getById = asyncHandler(async (req, res) => {
  const data = await projectService.getById(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Project fetched', data));
});

const create = asyncHandler(async (req, res) => {
  const data = await projectService.create(req.user.id, req.body, req.file);
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Project created', data));
});

const update = asyncHandler(async (req, res) => {
  const data = await projectService.update(req.params.id, req.body, req.file);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Project updated', data));
});

const remove = asyncHandler(async (req, res) => {
  await projectService.remove(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Project deleted', null));
});

const addImage = asyncHandler(async (req, res) => {
  const data = await projectService.addImage(req.params.id, req.file);
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Image added', data));
});

const addImages = asyncHandler(async (req, res) => {
  const data = await projectService.addImages(req.params.id, req.files);
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Images added', data));
});

const removeImage = asyncHandler(async (req, res) => {
  await projectService.removeImage(req.params.id, req.params.imageId);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Image deleted', null));
});

module.exports = { getAll, getById, create, update, remove, addImage, addImages, removeImage };
