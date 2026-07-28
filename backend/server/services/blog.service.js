const BlogRepository = require('../repositories/blog.repository');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');
const { toPublicUrl } = require('../utils/fileUrl');
const { requireFound, getPagination, paginatedResponse } = require('../utils/helpers');
const HTTP = require('../constants/httpStatus');

const repo = new BlogRepository();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const estimateReadingTime = (content = '') => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const createExcerpt = (content = '') =>
  content
    .replace(/[#>*_`\-\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);

const normalizeBlogInput = (body, file, existing = null) => {
  const status = body.status || (body.published ? 'published' : existing?.status || 'draft');
  const published = status === 'published';
  const cover_image = file
    ? toPublicUrl('blogs', file.filename)
    : body.cover_image !== undefined
      ? body.cover_image
      : existing?.cover_image;

  return {
    ...body,
    category: body.category || existing?.category || 'General',
    cover_image,
    excerpt: body.excerpt || existing?.excerpt || createExcerpt(body.content || existing?.content || ''),
    tags: Array.isArray(body.tags) ? body.tags : existing?.tags || [],
    status,
    reading_time: body.reading_time || estimateReadingTime(body.content || existing?.content || ''),
    seo_title: body.seo_title || existing?.seo_title || body.title || existing?.title || null,
    seo_description:
      body.seo_description
      || existing?.seo_description
      || body.excerpt
      || existing?.excerpt
      || createExcerpt(body.content || existing?.content || ''),
    featured: body.featured ?? existing?.featured ?? false,
    published,
  };
};

const ensureUniqueSlug = async (slug, excludeId = null) => {
  const existing = excludeId
    ? await repo.findBySlugExcludingId(slug, excludeId)
    : await repo.findBySlug(slug);
  if (existing) throw new ApiError(HTTP.CONFLICT, 'Slug already in use');
};

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const search = query.search?.trim() || null;

  const [rows, total] = await Promise.all([
    repo.findAll({ search, limit, offset }),
    repo.countFiltered({ search }),
  ]);

  return paginatedResponse(rows, total, page, limit);
};

const getByIdOrSlug = async (param) => {
  const blog = UUID_RE.test(param)
    ? await repo.findById(param)
    : await repo.findBySlug(param);
  return requireFound(blog, 'Blog not found');
};

const create = async (userId, body, file) => {
  const slug = body.slug ? slugify(body.slug) : slugify(body.title);
  await ensureUniqueSlug(slug);
  const normalized = normalizeBlogInput(body, file);
  if (!normalized.cover_image) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Cover image is required');
  }
  return repo.create({ ...normalized, user_id: userId, slug });
};

const update = async (id, body, file) => {
  const existing = requireFound(await repo.findById(id), 'Blog not found');

  let slug = existing.slug;
  if (body.slug) {
    slug = slugify(body.slug);
    if (slug !== existing.slug) await ensureUniqueSlug(slug, id);
  } else if (body.title && body.title !== existing.title) {
    slug = slugify(body.title);
    if (slug !== existing.slug) await ensureUniqueSlug(slug, id);
  }

  const normalized = normalizeBlogInput(body, file, existing);
  return requireFound(await repo.update(id, { ...normalized, slug }), 'Blog not found');
};

const remove = async (id) =>
  requireFound(await repo.deleteById(id), 'Blog not found');

module.exports = { getAll, getByIdOrSlug, create, update, remove };
