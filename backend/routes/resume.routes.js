const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { uploadResume } = require('../middlewares/upload.middleware');
const { resumeIdRule } = require('../validators/common.validator');
const { resumeUpdateRules } = require('../validators/resume.validator');
const resumeController = require('../controllers/resume.controller');

const router = express.Router();

router.get('/', resumeController.getAll);
router.get('/download', resumeController.download);
router.post('/upload', uploadResume.single('file'), resumeController.upload);
router.patch('/:id', validate([...resumeIdRule, ...resumeUpdateRules]), resumeController.update);
router.delete('/:id', validate(resumeIdRule), resumeController.remove);

module.exports = router;
