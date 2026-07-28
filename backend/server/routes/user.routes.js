const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const { updateProfileRules } = require('../validators/profile.validator');
const { changePasswordRules } = require('../validators/auth.validator');
const profileController = require('../controllers/profile.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', profileController.getProfile);
router.put('/profile', validate(updateProfileRules), profileController.updateProfile);
router.put('/avatar', uploadAvatar.single('avatar'), profileController.updateAvatar);
router.put('/password', validate(changePasswordRules), authController.changePassword);

module.exports = router;
