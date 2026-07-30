const UserRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const { toPublicUrl } = require('../utils/fileUrl');
const { requireFound } = require('../utils/helpers');
const HTTP = require('../constants/httpStatus');

const repo = new UserRepository();

const getProfile = async (userId) =>
  requireFound(await repo.findPublicById(userId), 'User not found');

const updateProfile = async (userId, body) => {
  if (body.email) {
    const taken = await repo.findByEmailExcludingId(body.email, userId);
    if (taken) throw new ApiError(HTTP.CONFLICT, 'Email already in use');
  }

  return requireFound(await repo.updateProfile(userId, body), 'User not found');
};

const updateAvatar = async (userId, file) => {
  if (!file) throw new ApiError(HTTP.BAD_REQUEST, 'Avatar file required');
  const avatar = toPublicUrl('avatars', file.filename);
  return requireFound(await repo.updateAvatar(userId, avatar), 'User not found');
};

module.exports = { getProfile, updateProfile, updateAvatar };
