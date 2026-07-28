const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');

const getAll = async (publishedOnly = false) => Project.findAll({ publishedOnly });

const getFeatured = async () => Project.findFeatured();

const getById = async (id) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');
  return project;
};

const getBySlug = async (slug, publishedOnly = false) => {
  const project = await Project.findBySlug(slug, publishedOnly);
  if (!project) throw new ApiError(404, 'Project not found');
  return project;
};

const create = async (data) => {
  if (!data.title) throw new ApiError(400, 'Title is required');
  const slug = data.slug || slugify(data.title);
  try {
    return await Project.create({ ...data, slug });
  } catch (error) {
    if (error.code === '23505') throw new ApiError(409, 'Slug already exists');
    throw error;
  }
};

const update = async (id, data) => {
  if (data.title && !data.slug) data.slug = slugify(data.title);
  try {
    const project = await Project.update(id, data);
    if (!project) throw new ApiError(404, 'Project not found');
    return project;
  } catch (error) {
    if (error.code === '23505') throw new ApiError(409, 'Slug already exists');
    throw error;
  }
};

const remove = async (id) => {
  const project = await Project.remove(id);
  if (!project) throw new ApiError(404, 'Project not found');
};

module.exports = { getAll, getFeatured, getById, getBySlug, create, update, remove };
