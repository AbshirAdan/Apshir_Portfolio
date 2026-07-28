const path = require('path');
const fs = require('fs');
const CvFile = require('../models/CvFile');
const ApiError = require('../utils/ApiError');
const config = require('../config');

const getActive = async () => {
  const cv = await CvFile.getActive();
  if (!cv) throw new ApiError(404, 'No CV available');
  return cv;
};

const getAll = async () => CvFile.findAll();

const upload = async (file) => {
  if (!file) throw new ApiError(400, 'CV file is required');
  return CvFile.create({
    file_name: file.originalname,
    file_path: `/uploads/cv/${file.filename}`,
    file_size: file.size,
  });
};

const remove = async (id) => {
  const cv = await CvFile.findAll();
  const target = cv.find((c) => c.id === parseInt(id, 10));
  if (!target) throw new ApiError(404, 'CV not found');

  const filePath = path.join(config.upload.dir, 'cv', path.basename(target.file_path));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await CvFile.remove(id);
};

const getFilePath = async () => {
  const cv = await getActive();
  return path.join(config.upload.dir, 'cv', path.basename(cv.file_path));
};

module.exports = { getActive, getAll, upload, remove, getFilePath };
