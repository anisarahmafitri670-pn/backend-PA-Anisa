const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function fileExtension(mimeType) {
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  return '.jpg';
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Format file tidak didukung. Hanya JPG, JPEG, PNG, dan WEBP.'));
  }

  return cb(null, true);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const baseDir = path.join(process.cwd(), 'uploads', 'galeri');
    try {
      fs.mkdirSync(baseDir, { recursive: true });
      cb(null, baseDir);
    } catch (error) {
      cb(error);
    }
  },
  filename(req, file, cb) {
    const judul = String(req.body.judul || 'galeri')
      .trim()
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 60);
    const ext = fileExtension(file.mimetype);
    cb(null, `${judul}_${Date.now()}${ext}`);
  }
});

const uploadGaleri = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = { uploadGaleri, ALLOWED_MIME_TYPES };
