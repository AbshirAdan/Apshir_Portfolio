const Profile = require('../models/Profile');

const getProfile = async () => {
  const profile = await Profile.get();
  return profile || {
    full_name: '', title: '', bio: '', avatar_url: '', email: '',
    phone: '', location: '', github_url: '', linkedin_url: '', twitter_url: '', website_url: '',
  };
};

const updateProfile = async (data) => Profile.update(data);

module.exports = { getProfile, updateProfile };
