const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const publicService = require('../services/public.service');
const visitorLogService = require('../services/visitorLog.service');
const HTTP = require('../constants/httpStatus');

const getSettings = asyncHandler(async (_req, res) => {
  const data = await publicService.getSettings();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Settings fetched', data));
});

const getProfile = asyncHandler(async (_req, res) => {
  const data = await publicService.getProfile();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Profile fetched', data));
});

const getStats = asyncHandler(async (_req, res) => {
  const data = await publicService.getStats();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Stats fetched', data));
});

const getProjects = asyncHandler(async (req, res) => {
  const data = await publicService.getProjects(req.query);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Projects fetched', data));
});

const getFeaturedProjects = asyncHandler(async (_req, res) => {
  const data = await publicService.getFeaturedProjects();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Featured projects fetched', data));
});

const getProjectBySlug = asyncHandler(async (req, res) => {
  const data = await publicService.getProjectBySlug(req.params.slug);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Project fetched', data));
});

const getSkills = asyncHandler(async (_req, res) => {
  const data = await publicService.getSkills();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Skills fetched', data));
});

const getCertificates = asyncHandler(async (_req, res) => {
  const data = await publicService.getCertificates();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Certificates fetched', data));
});

const getEducation = asyncHandler(async (_req, res) => {
  const data = await publicService.getEducation();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Education fetched', data));
});

const getExperience = asyncHandler(async (_req, res) => {
  const data = await publicService.getExperience();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Experience fetched', data));
});

const getBlogs = asyncHandler(async (req, res) => {
  const data = await publicService.getBlogs(req.query);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Blogs fetched', data));
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  const data = await publicService.getBlogBySlug(req.params.slug);
  res.status(HTTP.OK).json(new ApiResponse(true, 'Blog fetched', data));
});

const getResume = asyncHandler(async (_req, res) => {
  const data = await publicService.getResume();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Resume fetched', data));
});

const getSocialLinks = asyncHandler(async (_req, res) => {
  const data = await publicService.getSocialLinks();
  res.status(HTTP.OK).json(new ApiResponse(true, 'Social links fetched', data));
});

const submitContact = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);
  const data = await publicService.submitContact(req.body, req.user || null, files);
  res
    .status(HTTP.CREATED)
    .json(new ApiResponse(true, 'Your message has been sent successfully.', data));
});

const trackVisit = asyncHandler(async (req, res) => {
  await visitorLogService.track(req.body, req);
  res.status(HTTP.CREATED).json(new ApiResponse(true, 'Visit tracked', null));
});

module.exports = {
  getSettings,
  getProfile,
  getStats,
  getProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getSkills,
  getCertificates,
  getEducation,
  getExperience,
  getBlogs,
  getBlogBySlug,
  getResume,
  getSocialLinks,
  submitContact,
  trackVisit,
};
