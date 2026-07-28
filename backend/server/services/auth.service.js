const crypto = require('crypto');
const UserRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const { comparePassword, hashPassword } = require('../utils/bcrypt');
const { signToken, verifyToken } = require('../utils/jwt');
const { toPublicUrl } = require('../utils/fileUrl');
const HTTP = require('../constants/httpStatus');
const ROLES = require('../constants/roles');
const USER_STATUS = require('../constants/userStatus');
const config = require('../config');

const userRepo = new UserRepository();

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, reset_token, reset_token_expires, ...safe } = user;
  return safe;
};

const assertAccountActive = (user) => {
  const status = user.status || USER_STATUS.ACTIVE;
  if (status === USER_STATUS.BLOCKED) {
    throw new ApiError(HTTP.FORBIDDEN, 'Your account has been blocked. Contact support.');
  }
  if (status === USER_STATUS.INACTIVE) {
    throw new ApiError(HTTP.FORBIDDEN, 'Your account is inactive. Contact support.');
  }
};

const isAllowedRole = (role) =>
  role === ROLES.ADMIN || role === ROLES.USER || role === ROLES.EDITOR;

/**
 * Unified sign-in for Admin and User (shared login page).
 */
const signIn = async ({ email, password, remember = false }) => {
  const user = await userRepo.findByEmail(email);

  if (!user) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid email or password');
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid email or password');
  }

  assertAccountActive(user);

  if (!isAllowedRole(user.role)) {
    throw new ApiError(HTTP.FORBIDDEN, 'Access denied');
  }

  await userRepo.updateLastLogin(user.id);

  const expiresIn = remember ? '30d' : config.jwt.expiresIn;
  const token = signToken(
    { id: user.id, email: user.email, role: user.role },
    expiresIn
  );
  const fresh = await userRepo.findPublicById(user.id);

  return {
    token,
    user: sanitizeUser(fresh || user),
  };
};

/** Legacy alias — same unified flow. */
const login = signIn;

/** Public visitor registration (role = user). */
const register = async ({ full_name, email, password, phone }, avatarFile) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new ApiError(HTTP.CONFLICT, 'An account with this email already exists');
  }

  const hashed = await hashPassword(password);
  const avatar = avatarFile ? toPublicUrl('avatars', avatarFile.filename) : null;

  const user = await userRepo.createUser({
    full_name,
    email,
    password: hashed,
    phone: phone || null,
    avatar,
    role: ROLES.USER,
  });

  return sanitizeUser(user);
};

/** Legacy alias — unified sign-in. */
const userLogin = signIn;

const logout = async () => {
  return { message: 'Logged out successfully' };
};

const getProfile = async (userId) => {
  const user = await userRepo.findPublicById(userId);
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found');
  }
  return user;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await userRepo.findById(userId);

  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found');
  }

  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Current password is incorrect');
  }

  const hashed = await hashPassword(newPassword);
  const updated = await userRepo.updatePassword(userId, hashed);
  return updated;
};

const refreshToken = async (token) => {
  if (!token) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Token required');
  }

  const decoded = verifyToken(token);
  const user = await userRepo.findPublicById(decoded.id);

  if (!user) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid token');
  }

  const newToken = signToken({ id: user.id, email: user.email, role: user.role });
  return { token: newToken, user };
};

const forgotPassword = async ({ email }) => {
  const generic = {
    message: 'If an account exists for that email, a reset link has been generated.',
  };

  const user = await userRepo.findByEmail(email);
  if (!user || user.role === ROLES.ADMIN) {
    return generic;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await userRepo.setResetToken(user.id, rawToken, expiresAt);

  const resetLink = `${config.frontendUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
  // eslint-disable-next-line no-console
  console.info(`[auth] Password reset link for ${user.email}: ${resetLink}`);

  return {
    ...generic,
    resetLink,
    resetToken: rawToken,
  };
};

const resetPassword = async ({ token, newPassword }) => {
  if (!token) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Reset token is required');
  }

  const user = await userRepo.findByResetToken(token);
  if (!user) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Invalid or expired reset token');
  }

  const hashed = await hashPassword(newPassword);
  await userRepo.updatePassword(user.id, hashed);
  await userRepo.clearResetToken(user.id);

  return { message: 'Password has been reset successfully' };
};

module.exports = {
  signIn,
  login,
  register,
  userLogin,
  logout,
  getProfile,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
  sanitizeUser,
};
