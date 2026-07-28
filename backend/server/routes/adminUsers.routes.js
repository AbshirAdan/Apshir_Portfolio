const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const {
  listUsersRules,
  idParam,
  updateUserRules,
  statusRules,
  roleRules,
} = require('../validators/adminUsers.validator');
const adminUsersController = require('../controllers/adminUsers.controller');

const router = express.Router();

router.get('/', validate(listUsersRules), adminUsersController.listUsers);
router.get('/:id', validate(idParam), adminUsersController.getUser);
router.put(
  '/:id',
  uploadAvatar.single('avatar'),
  validate(updateUserRules),
  adminUsersController.updateUser
);
router.delete('/:id', validate(idParam), adminUsersController.deleteUser);
router.patch('/:id/status', validate(statusRules), adminUsersController.updateStatus);
router.patch('/:id/role', validate(roleRules), adminUsersController.updateRole);

module.exports = router;
