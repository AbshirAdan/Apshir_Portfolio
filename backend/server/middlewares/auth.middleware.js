const ApiError = require('../utils/ApiError');
const HTTP = require('../constants/httpStatus');
const { verifyToken } = require('../utils/jwt');
const UserRepository = require('../repositories/user.repository');
const USER_STATUS = require('../constants/userStatus');

const userRepo = new UserRepository();

/**
 * Verifies JWT Bearer token and attaches sanitized user to req.user.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(HTTP.UNAUTHORIZED, 'Authentication required');
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await userRepo.findPublicById(decoded.id);
    if (!user) {
      throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid token — user not found');
    }

    const status = user.status || USER_STATUS.ACTIVE;
    if (status === USER_STATUS.BLOCKED || status === USER_STATUS.INACTIVE) {
      throw new ApiError(
        HTTP.FORBIDDEN,
        status === USER_STATUS.BLOCKED
          ? 'Your account has been blocked'
          : 'Your account is inactive'
      );
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(HTTP.UNAUTHORIZED, 'Token expired — please login again'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(HTTP.UNAUTHORIZED, 'Invalid token'));
    }
    next(error);
  }
};

/**
 * Optional auth — attaches user when valid token present.
 */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await userRepo.findPublicById(decoded.id);
    if (user) {
      req.user = user;
      req.token = token;
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
};

module.exports = { authenticateToken, optionalAuth };
