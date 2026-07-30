const path = require('path');

module.exports = {
  root: path.join(__dirname, '../uploads'),
  maxFileSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 10 * 1024 * 1024,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocTypes: ['application/pdf'],
  allowedMessageTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};
