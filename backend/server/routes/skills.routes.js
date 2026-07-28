const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { createSkillRules, updateSkillRules, skillIdRule } = require('../validators/skill.validator');
const skillController = require('../controllers/skill.controller');

const router = express.Router();

router.get('/', skillController.getAll);
router.post('/', validate(createSkillRules), skillController.create);
router.put('/:id', validate(updateSkillRules), skillController.update);
router.delete('/:id', validate(skillIdRule), skillController.remove);

module.exports = router;
