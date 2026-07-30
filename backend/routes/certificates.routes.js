const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { uploadCertificate } = require('../middlewares/upload.middleware');
const {
  certificateRules,
  updateCertificateRules,
  certificateIdRule,
} = require('../validators/certificate.validator');
const certificateController = require('../controllers/certificate.controller');

const router = express.Router();

router.get('/', certificateController.getAll);
router.post('/', uploadCertificate.single('image'), validate(certificateRules), certificateController.create);
router.put('/:id', uploadCertificate.single('image'), validate(updateCertificateRules), certificateController.update);
router.delete('/:id', validate(certificateIdRule), certificateController.remove);

module.exports = router;
