const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const profileService = require('../services/profileService');
const projectService = require('../services/projectService');
const certificateService = require('../services/certificateService');
const skillService = require('../services/skillService');
const blogService = require('../services/blogService');
const contactService = require('../services/contactService');
const cvService = require('../services/cvService');
const path = require('path');
const fs = require('fs');

const getProfile = asyncHandler(async (_req, res) => {
  const data = await profileService.getProfile();
  res.json(new ApiResponse(true, 'Profile fetched', data));
});

const getProjects = asyncHandler(async (_req, res) => {
  const data = await projectService.getAll(true);
  res.json(new ApiResponse(true, 'Projects fetched', data));
});

const getFeaturedProjects = asyncHandler(async (_req, res) => {
  const data = await projectService.getFeatured();
  res.json(new ApiResponse(true, 'Featured projects fetched', data));
});

const getProjectBySlug = asyncHandler(async (req, res) => {
  const data = await projectService.getBySlug(req.params.slug, true);
  res.json(new ApiResponse(true, 'Project fetched', data));
});

const getCertificates = asyncHandler(async (_req, res) => {
  const data = await certificateService.getAll();
  res.json(new ApiResponse(true, 'Certificates fetched', data));
});

const getSkills = asyncHandler(async (_req, res) => {
  const data = await skillService.getAll();
  res.json(new ApiResponse(true, 'Skills fetched', data));
});

const getBlogPosts = asyncHandler(async (_req, res) => {
  const data = await blogService.getAll(true);
  res.json(new ApiResponse(true, 'Blog posts fetched', data));
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  const data = await blogService.getBySlug(req.params.slug, true);
  res.json(new ApiResponse(true, 'Blog post fetched', data));
});

const submitContact = asyncHandler(async (req, res) => {
  const data = await contactService.create(req.body);
  res.status(201).json(new ApiResponse(true, 'Message sent successfully', data));
});

const downloadCv = asyncHandler(async (_req, res) => {
  const filePath = await cvService.getFilePath();
  const cv = await cvService.getActive();
  if (!fs.existsSync(filePath)) {
    return res.status(404).json(new ApiResponse(false, 'CV file not found'));
  }
  res.download(filePath, cv.file_name);
});

module.exports = {
  getProfile, getProjects, getFeaturedProjects, getProjectBySlug,
  getCertificates, getSkills, getBlogPosts, getBlogBySlug,
  submitContact, downloadCv,
};
