const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createUpload = (subfolder, allowedTypes = /jpeg|jpg|png|gif|webp|pdf/) => {
  const dest = path.join(config.upload.dir, subfolder);
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
      const ext = path.extname(file.originalname).toLowerCase().slice(1);
      if (allowedTypes.test(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    },
  });
};

const uploadCv = createUpload('cv', /pdf/);
const uploadImage = createUpload('images');

module.exports = { uploadCv, uploadImage, ensureDir };
