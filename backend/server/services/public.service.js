const UserRepository = require('../repositories/user.repository');
const SettingsRepository = require('../repositories/settings.repository');
const ProjectRepository = require('../repositories/project.repository');
const SkillRepository = require('../repositories/skill.repository');
const CertificateRepository = require('../repositories/certificate.repository');
const EducationRepository = require('../repositories/education.repository');
const ExperienceRepository = require('../repositories/experience.repository');
const BlogRepository = require('../repositories/blog.repository');
const ResumeRepository = require('../repositories/resume.repository');
const SocialLinkRepository = require('../repositories/socialLink.repository');
const { requireFound, getPagination, paginatedResponse } = require('../utils/helpers');

const userRepo = new UserRepository();
const settingsRepo = new SettingsRepository();
const projectRepo = new ProjectRepository();
const skillRepo = new SkillRepository();
const certificateRepo = new CertificateRepository();
const educationRepo = new EducationRepository();
const experienceRepo = new ExperienceRepository();
const blogRepo = new BlogRepository();
const resumeRepo = new ResumeRepository();
const socialRepo = new SocialLinkRepository();

const mapProject = (project) => {
  if (!project) return null;
  return {
    ...project,
    technologies: typeof project.technologies === 'string'
      ? JSON.parse(project.technologies)
      : project.technologies,
  };
};

const getSettings = async () => {
  const settings = await settingsRepo.getSingleton();
  if (!settings) {
    return {
      site_title: null,
      hero_title: null,
      hero_subtitle: null,
      hero_description: null,
      logo: null,
      favicon: null,
      primary_color: '#2563EB',
      secondary_color: '#38BDF8',
      seo_meta_title: null,
      seo_description: null,
    };
  }
  const { id, created_at, updated_at, ...publicSettings } = settings;
  return publicSettings;
};

const getProfile = async () => {
  const profile = requireFound(
    await userRepo.findAdminProfile(),
    'Profile not found'
  );
  const { email, role, ...publicProfile } = profile;
  return publicProfile;
};

const getStats = async () => {
  const [projects, skills, certificates, blogs] = await Promise.all([
    projectRepo.countFiltered({ status: 'published' }),
    skillRepo.findAll().then((rows) => rows.length),
    certificateRepo.findAll().then((rows) => rows.length),
    blogRepo.countFiltered({ published: true }),
  ]);

  const profile = await userRepo.findAdminProfile();
  const education = profile ? await educationRepo.findAll(profile.id) : [];
  const experience = profile ? await experienceRepo.findAll(profile.id) : [];

  const yearsLearning = education.length
    ? Math.max(1, new Date().getFullYear() - new Date(education[education.length - 1]?.start_date || Date.now()).getFullYear())
    : 1;

  return {
    projects,
    skills,
    certificates,
    blogs,
    technologies: skills,
    yearsLearning,
    education: education.length,
    experience: experience.length,
  };
};

const getProjects = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const search = query.search?.trim() || null;
  const category = query.category || null;
  const featured = query.featured === 'true' ? true : query.featured === 'false' ? false : null;

  const [rows, total] = await Promise.all([
    projectRepo.findAll({ search, status: 'published', category, featured, limit, offset }),
    projectRepo.countFiltered({ search, status: 'published', category, featured }),
  ]);

  return paginatedResponse(rows.map(mapProject), total, page, limit);
};

const getFeaturedProjects = async () => {
  const rows = await projectRepo.findAll({
    status: 'published',
    featured: true,
    limit: 6,
    offset: 0,
  });
  return rows.map(mapProject);
};

const getProjectBySlug = async (slug) => {
  const project = requireFound(
    await projectRepo.findBySlug(slug, true),
    'Project not found'
  );
  const images = await projectRepo.findImages(project.id);
  return { ...mapProject(project), images };
};

const getSkills = async () => skillRepo.findAll();

const getCertificates = async () => certificateRepo.findAll();

const getEducation = async () => {
  const profile = await userRepo.findAdminProfile();
  return profile ? educationRepo.findAll(profile.id) : [];
};

const getExperience = async () => {
  const profile = await userRepo.findAdminProfile();
  return profile ? experienceRepo.findAll(profile.id) : [];
};

const getBlogs = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const search = query.search?.trim() || null;

  const [rows, total] = await Promise.all([
    blogRepo.findAll({ search, published: true, limit, offset }),
    blogRepo.countFiltered({ search, published: true }),
  ]);

  return paginatedResponse(rows, total, page, limit);
};

const getBlogBySlug = async (slug) =>
  requireFound(await blogRepo.findBySlug(slug, true), 'Blog post not found');

const getResume = async () => {
  const resumeService = require('./resume.service');
  return resumeService.getActivePublic();
};

const getSocialLinks = async () => socialRepo.findAll();

const submitContact = async (body, user = null, files = []) => {
  const communicationService = require('./communication.service');
  return communicationService.createContactConversation(body, user, files);
};

module.exports = {
  getSettings,
  getProfile,
  getStats,
  getProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getSkills,
  getCertificates,
  getEducation,
  getExperience,
  getBlogs,
  getBlogBySlug,
  getResume,
  getSocialLinks,
  submitContact,
};
