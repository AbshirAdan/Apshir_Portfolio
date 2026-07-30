const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { uploadSettings } = require('../middlewares/upload.middleware');
const { settingsRules } = require('../validators/settings.validator');
const settingsController = require('../controllers/settings.controller');

const router = express.Router();

router.get('/', settingsController.get);
router.put('/', uploadSettings.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }, { name: 'hero_avatar', maxCount: 1 }]), validate(settingsRules), settingsController.upsert);

module.exports = router;
