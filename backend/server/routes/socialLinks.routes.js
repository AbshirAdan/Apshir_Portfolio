const express = require('express');
const validate = require('../middlewares/validate.middleware');
const {
  socialLinkRules,
  updateSocialLinkRules,
  socialLinkIdRule,
} = require('../validators/socialLink.validator');
const socialLinkController = require('../controllers/socialLink.controller');

const router = express.Router();

router.get('/', socialLinkController.getAll);
router.post('/', validate(socialLinkRules), socialLinkController.create);
router.put('/:id', validate(updateSocialLinkRules), socialLinkController.update);
router.delete('/:id', validate(socialLinkIdRule), socialLinkController.remove);

module.exports = router;
