const { param } = require('express-validator');

const messageIdRule = [param('id').isUUID().withMessage('Invalid message ID')];
const resumeIdRule = [param('id').isUUID().withMessage('Invalid resume ID')];
const imageIdRule = [
  param('id').isUUID().withMessage('Invalid project ID'),
  param('imageId').isUUID().withMessage('Invalid image ID'),
];

module.exports = { messageIdRule, resumeIdRule, imageIdRule };
