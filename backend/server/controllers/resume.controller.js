const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const resumeService = require('../services/resume.service');
const HTTP = require('../constants/httpStatus');

const getAll = asyncHandler(async (_req, res) => {
  const data = await resumeService.getAll();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Resumes fetched', data));
});

const download = asyncHandler(async (_req, res) => {
  const data = await resumeService.getActive();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Active resume fetched', data));
});

const upload = asyncHandler(async (req, res) => {
  const data = await resumeService.create(req.file, {
    version: req.body.version,
    description: req.body.description,
  });
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Resume uploaded', data));
});

const update = asyncHandler(async (req, res) => {
  const data = await resumeService.update(req.params.id, {
    version: req.body.version,
    description: req.body.description,
  });
  res.status(HTTP.OK).json(new ApiResponse(true, 'Resume updated', data));
});

const remove = asyncHandler(async (req, res) => {
  await resumeService.remove(req.params.id);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Resume deleted', null));
});

module.exports = { getAll, download, upload, update, remove };
