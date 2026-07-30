const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { optionalAuth } = require('../middlewares/auth.middleware');
const { contactRules } = require('../validators/contact.validator');
const { analyticsRules } = require('../validators/public.validator');
const { uploadMessageAttachment } = require('../middlewares/upload.middleware');
const publicController = require('../controllers/public.controller');

const router = express.Router();

router.get('/settings', publicController.getSettings);
router.get('/profile', publicController.getProfile);
router.get('/stats', publicController.getStats);
router.get('/projects', publicController.getProjects);
router.get('/projects/featured', publicController.getFeaturedProjects);
router.get('/projects/:slug', publicController.getProjectBySlug);
router.get('/skills', publicController.getSkills);
router.get('/certificates', publicController.getCertificates);
router.get('/education', publicController.getEducation);
router.get('/experience', publicController.getExperience);
router.get('/blogs', publicController.getBlogs);
router.get('/blogs/:slug', publicController.getBlogBySlug);
router.get('/resume', publicController.getResume);
router.get('/social-links', publicController.getSocialLinks);
router.post(
  '/contact',
  optionalAuth,
  uploadMessageAttachment.array('attachments', 5),
  validate(contactRules),
  publicController.submitContact
);
router.post('/analytics', validate(analyticsRules), publicController.trackVisit);

module.exports = router;
