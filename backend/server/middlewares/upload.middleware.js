const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const HTTP = require('../constants/httpStatus');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

/**
 * Creates a multer instance for a given subfolder and allowed MIME types.
 * Files stored in server/uploads/{subfolder}/
 */
const createUploader = (subfolder, allowedMimeTypes) => {
  const dest = path.join(config.upload.root, subfolder);
  ensureDir(dest);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: config.upload.maxFileSize },
    fileFilter: (_req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new ApiError(HTTP.BAD_REQUEST, `File type not allowed: ${file.mimetype}`));
      }
    },
  });
};

const uploadImage = createUploader('images', config.upload.allowedImageTypes);
const uploadResume = createUploader('resumes', config.upload.allowedDocTypes);
const uploadProject = createUploader('projects', config.upload.allowedImageTypes);
const uploadBlog = createUploader('blogs', config.upload.allowedImageTypes);
const uploadCertificate = createUploader('certificates', config.upload.allowedImageTypes);
const uploadAvatar = createUploader('avatars', config.upload.allowedImageTypes);
const uploadLogo = createUploader('logos', config.upload.allowedImageTypes);
const uploadMessageAttachment = createUploader(
  'messages',
  config.upload.allowedMessageTypes
);

module.exports = {
  uploadImage,
  uploadResume,
  uploadProject,
  uploadBlog,
  uploadCertificate,
  uploadAvatar,
  uploadLogo,
  uploadMessageAttachment,
  ensureDir,
};
