const express = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRole = require('../middlewares/authorize.middleware');
const ROLES = require('../constants/roles');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const adminUsersRoutes = require('./adminUsers.routes');
const dashboardRoutes = require('./dashboard.routes');
const profileRoutes = require('./profile.routes');
const projectRoutes = require('./projects.routes');
const skillRoutes = require('./skills.routes');
const blogRoutes = require('./blogs.routes');
const communicationRoutes = require('./communication.routes');
const certificateRoutes = require('./certificates.routes');
const settingsRoutes = require('./settings.routes');
const resumeRoutes = require('./resume.routes');
const educationRoutes = require('./education.routes');
const experienceRoutes = require('./experience.routes');
const socialLinkRoutes = require('./socialLinks.routes');
const publicRoutes = require('./public.routes');

const router = express.Router();

const adminOnly = [authenticateToken, authorizeRole(ROLES.ADMIN)];

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/public', publicRoutes);

router.use('/admin/users', adminOnly, adminUsersRoutes);
router.use('/users', adminOnly, adminUsersRoutes);

router.use('/dashboard', adminOnly, dashboardRoutes);
router.use('/profile', adminOnly, profileRoutes);

router.use('/projects', adminOnly, projectRoutes);
router.use('/skills', adminOnly, skillRoutes);
router.use('/blogs', adminOnly, blogRoutes);

// Professional Communication Center (contact, conversations, notifications)
router.use('/', communicationRoutes);

router.use('/certificates', adminOnly, certificateRoutes);
router.use('/settings', adminOnly, settingsRoutes);
router.use('/resume', adminOnly, resumeRoutes);
router.use('/education', adminOnly, educationRoutes);
router.use('/experience', adminOnly, experienceRoutes);
router.use('/social-links', adminOnly, socialLinkRoutes);

module.exports = router;
