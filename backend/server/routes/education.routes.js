const express = require('express');
const validate = require('../middlewares/validate.middleware');
const {
  educationRules,
  updateEducationRules,
  educationIdRule,
} = require('../validators/education.validator');
const educationController = require('../controllers/education.controller');

const router = express.Router();

router.get('/', educationController.getAll);
router.post('/', validate(educationRules), educationController.create);
router.put('/:id', validate(updateEducationRules), educationController.update);
router.delete('/:id', validate(educationIdRule), educationController.remove);

module.exports = router;
