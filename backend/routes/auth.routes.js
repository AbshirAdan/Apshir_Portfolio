const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRole = require('../middlewares/authorize.middleware');
const { authRateLimiter } = require('../middlewares/rateLimiter.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const {
  loginRules,
  userLoginRules,
  registerRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
  refreshTokenRules,
} = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(authRateLimiter);

// ── Shared sign-in (Admin + User) ───────────────────────────
router.post('/signin', validate(userLoginRules), authController.signIn);
router.post('/login', validate(userLoginRules), authController.login);
router.post('/refresh-token', validate(refreshTokenRules), authController.refreshToken);

// ── Registration ────────────────────────────────────────────
router.post(
  '/register',
  uploadAvatar.single('avatar'),
  validate(registerRules),
  authController.register
);

router.post('/user/login', validate(userLoginRules), authController.userLogin);
router.post('/forgot-password', validate(forgotPasswordRules), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordRules), authController.resetPassword);

// ── OAuth (Google & GitHub) ─────────────────────────────────
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);
router.get('/github', authController.githubLogin);
router.get('/github/callback', authController.githubCallback);

// ── Authenticated (admin or user) ───────────────────────────
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getProfile);
router.get('/profile', authenticateToken, authorizeRole(ROLES.ADMIN), authController.getProfile);
router.put(
  '/change-password',
  authenticateToken,
  validate(changePasswordRules),
  authController.changePassword
);

module.exports = router;
