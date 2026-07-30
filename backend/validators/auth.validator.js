const { body } = require('express-validator');

const PASSWORD_RULES = {
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}|\\:;"'<>,.?/~`+=_-]).+$/,
  message:
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
};

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

const userLoginRules = [
  ...loginRules,
  body('remember').optional().isBoolean().withMessage('Remember must be a boolean'),
];

const registerRules = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Full name must be 2–255 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 50 }).withMessage('Phone must be at most 50 characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: PASSWORD_RULES.minLength }).withMessage(PASSWORD_RULES.message)
    .matches(PASSWORD_RULES.pattern).withMessage(PASSWORD_RULES.message),
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: PASSWORD_RULES.minLength }).withMessage(PASSWORD_RULES.message)
    .matches(PASSWORD_RULES.pattern).withMessage(PASSWORD_RULES.message),
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
];

const resetPasswordRules = [
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: PASSWORD_RULES.minLength }).withMessage(PASSWORD_RULES.message)
    .matches(PASSWORD_RULES.pattern).withMessage(PASSWORD_RULES.message),
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const refreshTokenRules = [
  body('token').optional().isString().withMessage('Token must be a string'),
];

module.exports = {
  loginRules,
  userLoginRules,
  registerRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
  refreshTokenRules,
  PASSWORD_RULES,
};
