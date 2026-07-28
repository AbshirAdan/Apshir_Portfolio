const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { listRules, messageIdRule } = require('../validators/contact.validator');
const messageController = require('../controllers/message.controller');

const router = express.Router();

router.get('/', validate(listRules), messageController.getUserMessages);
router.get('/:id', validate(messageIdRule), messageController.getUserMessageById);
router.patch('/:id/read', validate(messageIdRule), messageController.markUserRead);

module.exports = router;
