const toPublicUrl = (subfolder, filename) => `/uploads/${subfolder}/${filename}`;

const parseFilename = (filePath) => {
  if (!filePath) return null;
  return filePath.split('/').pop();
};

module.exports = { toPublicUrl, parseFilename };
