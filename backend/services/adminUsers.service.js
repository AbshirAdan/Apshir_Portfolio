const UserRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const { toPublicUrl } = require('../utils/fileUrl');
const { requireFound, getPagination, paginatedResponse } = require('../utils/helpers');
const HTTP = require('../constants/httpStatus');
const ROLES = require('../constants/roles');
const USER_STATUS = require('../constants/userStatus');
const config = require('../config');

const repo = new UserRepository();

const sanitize = (user) => {
  if (!user) return null;
  const { password, reset_token, reset_token_expires, ...safe } = user;
  return safe;
};

const isSuperAdmin = (user) => {
  if (!user) return false;
  const seedEmail = config.adminSeed?.email?.toLowerCase();
  if (seedEmail && user.email?.toLowerCase() === seedEmail) return true;
  return false;
};

const assertNotSelfDestructive = (actorId, targetId, action) => {
  if (actorId === targetId) {
    throw new ApiError(HTTP.FORBIDDEN, `You cannot ${action} your own account`);
  }
};

const listUsers = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const search = query.search?.trim() || null;
  const role = query.role?.trim() || null;
  const status = query.status?.trim() || null;
  const sortBy = query.sortBy || query.sort || 'created_at';
  const sortOrder =
    query.sortOrder ||
    (query.dateJoined === 'oldest' ? 'asc' : query.dateJoined === 'newest' ? 'desc' : 'desc');

  const [items, total, stats] = await Promise.all([
    repo.findAdminList({ search, role, status, sortBy, sortOrder, limit, offset }),
    repo.countAdminFiltered({ search, role, status }),
    repo.getAdminStats(),
  ]);

  return {
    ...paginatedResponse(items.map(sanitize), total, page, limit),
    stats: {
      totalUsers: stats.total_users,
      activeUsers: stats.active_users,
      inactiveUsers: stats.inactive_users,
      blockedUsers: stats.blocked_users,
      administrators: stats.administrators,
      newUsersThisMonth: stats.new_users_this_month,
    },
  };
};

const getUserById = async (id) => {
  const user = requireFound(await repo.findPublicById(id), 'User not found');
  return sanitize(user);
};

const updateUser = async (id, body, actorId, avatarFile) => {
  const existing = requireFound(await repo.findById(id), 'User not found');

  if (body.email) {
    const taken = await repo.findByEmailExcludingId(body.email, id);
    if (taken) throw new ApiError(HTTP.CONFLICT, 'Email already in use');
  }

  if (isSuperAdmin(existing)) {
    if (body.role && body.role !== ROLES.ADMIN) {
      throw new ApiError(HTTP.FORBIDDEN, 'Cannot change the Super Admin role');
    }
    if (body.status && body.status !== USER_STATUS.ACTIVE) {
      throw new ApiError(HTTP.FORBIDDEN, 'Cannot deactivate or block the Super Admin');
    }
  }

  if (body.role && body.role !== existing.role) {
    if (existing.role === ROLES.ADMIN && body.role !== ROLES.ADMIN) {
      assertNotSelfDestructive(actorId, id, 'demote');
      const adminCount = await repo.countAdmins();
      if (adminCount <= 1) {
        throw new ApiError(HTTP.FORBIDDEN, 'Cannot demote the last administrator');
      }
    }
  }

  const avatar = avatarFile ? toPublicUrl('avatars', avatarFile.filename) : undefined;

  const updated = await repo.adminUpdate(id, {
    full_name: body.full_name,
    email: body.email,
    phone: body.phone,
    bio: body.bio,
    role: body.role,
    status: body.status,
    avatar,
  });

  return sanitize(requireFound(updated, 'User not found'));
};

const deleteUser = async (id, actorId) => {
  assertNotSelfDestructive(actorId, id, 'delete');

  const existing = requireFound(await repo.findById(id), 'User not found');

  if (isSuperAdmin(existing)) {
    throw new ApiError(HTTP.FORBIDDEN, 'Cannot delete the Super Admin account');
  }

  if (existing.role === ROLES.ADMIN) {
    const adminCount = await repo.countAdmins();
    if (adminCount <= 1) {
      throw new ApiError(HTTP.FORBIDDEN, 'Cannot delete the last administrator');
    }
  }

  requireFound(await repo.deleteById(id), 'User not found');
  return { id };
};

const updateStatus = async (id, status, actorId) => {
  assertNotSelfDestructive(actorId, id, 'change status of');

  const existing = requireFound(await repo.findById(id), 'User not found');

  if (isSuperAdmin(existing) && status !== USER_STATUS.ACTIVE) {
    throw new ApiError(HTTP.FORBIDDEN, 'Cannot deactivate or block the Super Admin');
  }

  const updated = await repo.updateStatus(id, status);
  return sanitize(requireFound(updated, 'User not found'));
};

const updateRole = async (id, role, actorId) => {
  assertNotSelfDestructive(actorId, id, 'change role of');

  const existing = requireFound(await repo.findById(id), 'User not found');

  if (isSuperAdmin(existing) && role !== ROLES.ADMIN) {
    throw new ApiError(HTTP.FORBIDDEN, 'Cannot change the Super Admin role');
  }

  if (existing.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
    const adminCount = await repo.countAdmins();
    if (adminCount <= 1) {
      throw new ApiError(HTTP.FORBIDDEN, 'Cannot demote the last administrator');
    }
  }

  const updated = await repo.updateRole(id, role);
  return sanitize(requireFound(updated, 'User not found'));
};

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateStatus,
  updateRole,
  isSuperAdmin,
  sanitize,
};
