const { body, param } = require('express-validator');

const certificateRules = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('organization').optional().trim(),
  body('issue_date').optional().isISO8601().withMessage('Invalid date format'),
  body('credential_url').optional().isURL().withMessage('Invalid URL'),
];

const updateCertificateRules = [
  param('id').isUUID().withMessage('Invalid certificate ID'),
  ...certificateRules.map((r) => r.optional()),
];

const certificateIdRule = [param('id').isUUID().withMessage('Invalid certificate ID')];

module.exports = { certificateRules, updateCertificateRules, certificateIdRule };
