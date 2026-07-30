const express = require('express');
const validate = require('../middlewares/validate.middleware');
const {
  experienceRules,
  updateExperienceRules,
  experienceIdRule,
} = require('../validators/experience.validator');
const experienceController = require('../controllers/experience.controller');

const router = express.Router();

router.get('/', experienceController.getAll);
router.post('/', validate(experienceRules), experienceController.create);
router.put('/:id', validate(updateExperienceRules), experienceController.update);
router.delete('/:id', validate(experienceIdRule), experienceController.remove);

module.exports = router;
