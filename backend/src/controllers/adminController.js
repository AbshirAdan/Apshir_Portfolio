const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const profileService = require('../services/profileService');
const projectService = require('../services/projectService');
const certificateService = require('../services/certificateService');
const skillService = require('../services/skillService');
const blogService = require('../services/blogService');
const contactService = require('../services/contactService');
const cvService = require('../services/cvService');
const dashboardService = require('../services/dashboardService');

const getProfile = asyncHandler(async (_req, res) => {
  res.json(new ApiResponse(true, 'Profile fetched', await profileService.getProfile()));
});

const updateProfile = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(true, 'Profile updated', await profileService.updateProfile(req.body)));
});

const getProjects = asyncHandler(async (_req, res) => {
  res.json(new ApiResponse(true, 'Projects fetched', await projectService.getAll()));
});

const getProject = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(true, 'Project fetched', await projectService.getById(req.params.id)));
});

const createProject = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse(true, 'Project created', await projectService.create(req.body)));
});

const updateProject = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(true, 'Project updated', await projectService.update(req.params.id, req.body)));
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.remove(req.params.id);
  res.json(new ApiResponse(true, 'Project deleted'));
});

const getCertificates = asyncHandler(async (_req, res) => {
  res.json(new ApiResponse(true, 'Certificates fetched', await certificateService.getAll()));
});

const createCertificate = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse(true, 'Certificate created', await certificateService.create(req.body)));
});

const updateCertificate = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(true, 'Certificate updated', await certificateService.update(req.params.id, req.body)));
});

const deleteCertificate = asyncHandler(async (req, res) => {
  await certificateService.remove(req.params.id);
  res.json(new ApiResponse(true, 'Certificate deleted'));
});

const getSkills = asyncHandler(async (_req, res) => {
  res.json(new ApiResponse(true, 'Skills fetched', await skillService.getAll()));
});

const createSkill = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse(true, 'Skill created', await skillService.create(req.body)));
});

const updateSkill = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(true, 'Skill updated', await skillService.update(req.params.id, req.body)));
});

const deleteSkill = asyncHandler(async (req, res) => {
  await skillService.remove(req.params.id);
  res.json(new ApiResponse(true, 'Skill deleted'));
});

const getBlogPosts = asyncHandler(async (_req, res) => {
  res.json(new ApiResponse(true, 'Blog posts fetched', await blogService.getAll()));
});

const getBlogPost = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(true, 'Blog post fetched', await blogService.getById(req.params.id)));
});

const createBlogPost = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse(true, 'Blog post created', await blogService.create(req.body)));
});

const updateBlogPost = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(true, 'Blog post updated', await blogService.update(req.params.id, req.body)));
});

const deleteBlogPost = asyncHandler(async (req, res) => {
  await blogService.remove(req.params.id);
  res.json(new ApiResponse(true, 'Blog post deleted'));
});

const getMessages = asyncHandler(async (_req, res) => {
  res.json(new ApiResponse(true, 'Messages fetched', await contactService.getAll()));
});

const markMessageRead = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(true, 'Message marked as read', await contactService.markRead(req.params.id)));
});

const deleteMessage = asyncHandler(async (req, res) => {
  await contactService.remove(req.params.id);
  res.json(new ApiResponse(true, 'Message deleted'));
});

const getCvFiles = asyncHandler(async (_req, res) => {
  res.json(new ApiResponse(true, 'CV files fetched', await cvService.getAll()));
});

const uploadCv = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse(true, 'CV uploaded', await cvService.upload(req.file)));
});

const deleteCv = asyncHandler(async (req, res) => {
  await cvService.remove(req.params.id);
  res.json(new ApiResponse(true, 'CV deleted'));
});

const getStats = asyncHandler(async (_req, res) => {
  res.json(new ApiResponse(true, 'Stats fetched', await dashboardService.getStats()));
});

const getSettings = asyncHandler(async (_req, res) => {
  res.json(new ApiResponse(true, 'Settings fetched', await dashboardService.getSettings()));
});

const updateSettings = asyncHandler(async (req, res) => {
  await dashboardService.updateSettings(req.body);
  res.json(new ApiResponse(true, 'Settings updated', await dashboardService.getSettings()));
});

module.exports = {
  getProfile, updateProfile,
  getProjects, getProject, createProject, updateProject, deleteProject,
  getCertificates, createCertificate, updateCertificate, deleteCertificate,
  getSkills, createSkill, updateSkill, deleteSkill,
  getBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost,
  getMessages, markMessageRead, deleteMessage,
  getCvFiles, uploadCv, deleteCv,
  getStats, getSettings, updateSettings,
};
