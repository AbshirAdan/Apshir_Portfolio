const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const BlogPost = require('../models/BlogPost');
const ContactMessage = require('../models/ContactMessage');
const SiteSetting = require('../models/SiteSetting');

const getStats = async () => ({
  projects: await Project.count(),
  certificates: await Certificate.count(),
  blogPosts: await BlogPost.count(),
  messages: await ContactMessage.count(),
  unreadMessages: await ContactMessage.countUnread(),
});

const getSettings = async () => SiteSetting.getAll();

const updateSettings = async (settings) => SiteSetting.setMany(settings);

module.exports = { getStats, getSettings, updateSettings };
