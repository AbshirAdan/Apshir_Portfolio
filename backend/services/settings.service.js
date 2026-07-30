const SettingsRepository = require('../repositories/settings.repository');
const { toPublicUrl } = require('../utils/fileUrl');

const repo = new SettingsRepository();

const get = async () => {
  const settings = await repo.getSingleton();
  return settings || {};
};

const upsert = async (body, files = {}) => {
  const updates = { ...body };
  if (files.logo?.[0]) {
    updates.logo = toPublicUrl('logos', files.logo[0].filename);
  }
  if (files.favicon?.[0]) {
    updates.favicon = toPublicUrl('logos', files.favicon[0].filename);
  }
  if (files.hero_avatar?.[0]) {
    updates.hero_avatar = toPublicUrl('avatars', files.hero_avatar[0].filename);
  }
  return repo.upsert(updates);
};

module.exports = { get, upsert };
