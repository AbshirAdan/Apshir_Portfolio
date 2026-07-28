const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const { updateProfileRules } = require('../validators/profile.validator');
const profileController = require('../controllers/profile.controller');

const router = express.Router();

router.get('/', profileController.getProfile);
router.put('/', validate(updateProfileRules), profileController.updateProfile);
router.put('/avatar', uploadAvatar.single('avatar'), profileController.updateAvatar);

module.exports = router;
