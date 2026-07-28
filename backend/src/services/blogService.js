const BlogPost = require('../models/BlogPost');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');

const getAll = async (publishedOnly = false) => BlogPost.findAll({ publishedOnly });

const getById = async (id) => {
  const post = await BlogPost.findById(id);
  if (!post) throw new ApiError(404, 'Blog post not found');
  return post;
};

const getBySlug = async (slug, publishedOnly = false) => {
  const post = await BlogPost.findBySlug(slug, publishedOnly);
  if (!post) throw new ApiError(404, 'Blog post not found');
  return post;
};

const create = async (data) => {
  if (!data.title) throw new ApiError(400, 'Title is required');
  const slug = data.slug || slugify(data.title);
  try {
    return await BlogPost.create({ ...data, slug });
  } catch (error) {
    if (error.code === '23505') throw new ApiError(409, 'Slug already exists');
    throw error;
  }
};

const update = async (id, data) => {
  if (data.title && !data.slug) data.slug = slugify(data.title);
  try {
    const post = await BlogPost.update(id, data);
    if (!post) throw new ApiError(404, 'Blog post not found');
    return post;
  } catch (error) {
    if (error.code === '23505') throw new ApiError(409, 'Slug already exists');
    throw error;
  }
};

const remove = async (id) => {
  const post = await BlogPost.remove(id);
  if (!post) throw new ApiError(404, 'Blog post not found');
};

module.exports = { getAll, getById, getBySlug, create, update, remove };
