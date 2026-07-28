const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadCv } = require('../middleware/upload');
const authController = require('../controllers/authController');
const publicController = require('../controllers/publicController');
const adminController = require('../controllers/adminController');
const { getHealth } = require('../controllers/healthController');

const router = express.Router();

// Health
router.get('/health', getHealth);

// Auth
router.post('/auth/login', validate([
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
]), authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);

// Public routes
const publicRouter = express.Router();
publicRouter.get('/profile', publicController.getProfile);
publicRouter.get('/projects', publicController.getProjects);
publicRouter.get('/projects/featured', publicController.getFeaturedProjects);
publicRouter.get('/projects/:slug', publicController.getProjectBySlug);
publicRouter.get('/certificates', publicController.getCertificates);
publicRouter.get('/skills', publicController.getSkills);
publicRouter.get('/blog', publicController.getBlogPosts);
publicRouter.get('/blog/:slug', publicController.getBlogBySlug);
publicRouter.post('/contact', validate([
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('message').trim().notEmpty().withMessage('Message required'),
]), publicController.submitContact);
publicRouter.get('/cv/download', publicController.downloadCv);

router.use('/public', publicRouter);

// Admin routes (protected)
const adminRouter = express.Router();
adminRouter.use(authMiddleware);

adminRouter.get('/dashboard/stats', adminController.getStats);
adminRouter.get('/profile', adminController.getProfile);
adminRouter.put('/profile', adminController.updateProfile);

adminRouter.get('/projects', adminController.getProjects);
adminRouter.get('/projects/:id', adminController.getProject);
adminRouter.post('/projects', adminController.createProject);
adminRouter.put('/projects/:id', adminController.updateProject);
adminRouter.delete('/projects/:id', adminController.deleteProject);

adminRouter.get('/certificates', adminController.getCertificates);
adminRouter.post('/certificates', adminController.createCertificate);
adminRouter.put('/certificates/:id', adminController.updateCertificate);
adminRouter.delete('/certificates/:id', adminController.deleteCertificate);

adminRouter.get('/skills', adminController.getSkills);
adminRouter.post('/skills', adminController.createSkill);
adminRouter.put('/skills/:id', adminController.updateSkill);
adminRouter.delete('/skills/:id', adminController.deleteSkill);

adminRouter.get('/blog', adminController.getBlogPosts);
adminRouter.get('/blog/:id', adminController.getBlogPost);
adminRouter.post('/blog', adminController.createBlogPost);
adminRouter.put('/blog/:id', adminController.updateBlogPost);
adminRouter.delete('/blog/:id', adminController.deleteBlogPost);

adminRouter.get('/contact', adminController.getMessages);
adminRouter.patch('/contact/:id/read', adminController.markMessageRead);
adminRouter.delete('/contact/:id', adminController.deleteMessage);

adminRouter.get('/cv', adminController.getCvFiles);
adminRouter.post('/cv', uploadCv.single('cv'), adminController.uploadCv);
adminRouter.delete('/cv/:id', adminController.deleteCv);

adminRouter.get('/settings', adminController.getSettings);
adminRouter.put('/settings', adminController.updateSettings);

router.use('/admin', adminRouter);

module.exports = router;
