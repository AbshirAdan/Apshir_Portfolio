const ProjectRepository = require('../repositories/project.repository');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');
const { toPublicUrl } = require('../utils/fileUrl');
const { requireFound, getPagination, paginatedResponse } = require('../utils/helpers');
const HTTP = require('../constants/httpStatus');

const repo = new ProjectRepository();

const mapProject = (project) => {
  if (!project) return null;
  return {
    ...project,
    technologies: typeof project.technologies === 'string'
      ? JSON.parse(project.technologies)
      : project.technologies,
  };
};

const ensureUniqueSlug = async (slug, excludeId = null) => {
  const existing = excludeId
    ? await repo.findBySlugExcludingId(slug, excludeId)
    : await repo.findBySlug(slug);
  if (existing) {
    throw new ApiError(HTTP.CONFLICT, 'Slug already in use');
  }
};

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const search = query.search?.trim() || null;
  const status = query.status || null;

  const [rows, total] = await Promise.all([
    repo.findAll({ search, status, limit, offset }),
    repo.countFiltered({ search, status }),
  ]);

  return paginatedResponse(rows.map(mapProject), total, page, limit);
};

const getById = async (id) => {
  const project = requireFound(await repo.findById(id), 'Project not found');
  const images = await repo.findImages(id);
  return { ...mapProject(project), images };
};

const getBySlug = async (slug) => {
  const project = requireFound(await repo.findBySlug(slug), 'Project not found');
  const images = await repo.findImages(project.id);
  return { ...mapProject(project), images };
};

const create = async (userId, body, file) => {
  const slug = body.slug ? slugify(body.slug) : slugify(body.title);
  await ensureUniqueSlug(slug);

  const thumbnail = file ? toPublicUrl('projects', file.filename) : null;

  const project = await repo.create({
    user_id: userId,
    ...body,
    slug,
    thumbnail,
  });

  return mapProject(project);
};

const update = async (id, body, file) => {
  const existing = requireFound(await repo.findById(id), 'Project not found');

  let slug = existing.slug;
  if (body.slug) {
    slug = slugify(body.slug);
    if (slug !== existing.slug) await ensureUniqueSlug(slug, id);
  } else if (body.title && body.title !== existing.title) {
    slug = slugify(body.title);
    if (slug !== existing.slug) await ensureUniqueSlug(slug, id);
  }

  const thumbnail = file ? toPublicUrl('projects', file.filename) : undefined;

  const project = await repo.update(id, { ...body, slug, thumbnail });
  return mapProject(project);
};

const remove = async (id) => {
  requireFound(await repo.deleteById(id), 'Project not found');
};

const addImage = async (projectId, file) => {
  requireFound(await repo.findById(projectId), 'Project not found');
  if (!file) throw new ApiError(HTTP.BAD_REQUEST, 'Image file required');

  return repo.addImage(projectId, toPublicUrl('projects', file.filename));
};

const addImages = async (projectId, files) => {
  requireFound(await repo.findById(projectId), 'Project not found');
  if (!files?.length) throw new ApiError(HTTP.BAD_REQUEST, 'At least one image file required');

  const uploaded = [];
  for (const file of files) {
    uploaded.push(await repo.addImage(projectId, toPublicUrl('projects', file.filename)));
  }
  return uploaded;
};

const removeImage = async (projectId, imageId) => {
  requireFound(await repo.findById(projectId), 'Project not found');
  const image = requireFound(await repo.findImageById(imageId), 'Image not found');

  if (image.project_id !== projectId) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Image does not belong to this project');
  }

  await repo.deleteImage(imageId);
};

module.exports = {
  getAll, getById, getBySlug, create, update, remove, addImage, addImages, removeImage,
};
