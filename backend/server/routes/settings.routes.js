const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { uploadLogo } = require('../middlewares/upload.middleware');
const { settingsRules } = require('../validators/settings.validator');
const settingsController = require('../controllers/settings.controller');

const router = express.Router();

router.get('/', settingsController.get);
router.put('/', uploadLogo.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), validate(settingsRules), settingsController.upsert);

module.exports = router;
