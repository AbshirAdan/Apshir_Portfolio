const { body, param, query } = require('express-validator');
const ROLES = require('../constants/roles');
const USER_STATUS = require('../constants/userStatus');

const listUsersRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ max: 255 }),
  query('role').optional().isIn([ROLES.ADMIN, ROLES.EDITOR, ROLES.USER]),
  query('status').optional().isIn([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.BLOCKED]),
  query('sortBy').optional().isIn(['name', 'email', 'created_at', 'last_login', 'registration_date']),
  query('sort').optional().isIn(['name', 'email', 'created_at', 'last_login', 'registration_date']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('dateJoined').optional().isIn(['newest', 'oldest']),
];

const idParam = [param('id').isUUID().withMessage('Valid user id required')];

const updateUserRules = [
  ...idParam,
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 50 }),
  body('bio').optional({ values: 'falsy' }).trim().isLength({ max: 5000 }),
  body('role').optional().isIn([ROLES.ADMIN, ROLES.EDITOR, ROLES.USER]),
  body('status').optional().isIn([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.BLOCKED]),
];

const statusRules = [
  ...idParam,
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.BLOCKED]),
];

const roleRules = [
  ...idParam,
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn([ROLES.ADMIN, ROLES.EDITOR, ROLES.USER]),
];

module.exports = {
  listUsersRules,
  idParam,
  updateUserRules,
  statusRules,
  roleRules,
};
