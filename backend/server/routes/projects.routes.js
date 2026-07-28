const express = require('express');
const validate = require('../middlewares/validate.middleware');
const parseProjectBody = require('../middlewares/parseProjectBody.middleware');
const { uploadProject } = require('../middlewares/upload.middleware');
const {
  createProjectRules,
  updateProjectRules,
  projectIdRule,
} = require('../validators/project.validator');
const { imageIdRule } = require('../validators/common.validator');
const projectController = require('../controllers/project.controller');

const router = express.Router();

router.get('/', projectController.getAll);
router.get('/:id', validate(projectIdRule), projectController.getById);
router.post('/', uploadProject.single('thumbnail'), parseProjectBody, validate(createProjectRules), projectController.create);
router.put('/:id', uploadProject.single('thumbnail'), parseProjectBody, validate(updateProjectRules), projectController.update);
router.delete('/:id', validate(projectIdRule), projectController.remove);
router.post('/:id/images', uploadProject.array('images', 10), validate(projectIdRule), projectController.addImages);
router.delete('/:id/images/:imageId', validate(imageIdRule), projectController.removeImage);

module.exports = router;
