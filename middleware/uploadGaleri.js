const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getExtension(mimeType) {
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  return '.jpg';
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Format file tidak didukung. Hanya JPG, PNG, dan WEBP.'));
  }

  return cb(null, true);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'galeri');

    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename(req, file, cb) {
    const random = Math.round(Math.random() * 1e9);
    cb(null, `galeri-${Date.now()}-${random}${getExtension(file.mimetype)}`);
  }
});

const uploadGaleri = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

function handleGaleriUpload(req, res, next) {
  return uploadGaleri.single('foto')(req, res, (error) => {
    if (!error) return next();

    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Ukuran file maksimal 5 MB'
      : error.message;

    return res.status(400).json({
      success: false,
      message
    });
  });
}

module.exports = {
  uploadGaleri,
  handleGaleriUpload
};
