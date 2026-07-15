const fs = require('fs');
const path = require('path');
const multer = require('multer');
const R = require('../utils/response');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
]);

function toSafeName(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, 120);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'surat-hasil');
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename(req, file, cb) {
    const layanan = toSafeName(req.layanan || req.params.layanan || 'layanan');
    const idPengajuan = toSafeName(req.params.id || 'pengajuan');
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `surat_hasil_${layanan}_${idPengajuan}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error('Format file tidak sesuai. Gunakan PDF, JPG, JPEG, atau PNG.'));
    }
    return cb(null, true);
  }
});

function uploadSuratHasil(req, res, next) {
  upload.single('surat_hasil')(req, res, (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return R.badRequest(res, 'Ukuran file maksimal 5 MB');
      }
      return R.badRequest(res, error.message);
    }
    return next();
  });
}

module.exports = { uploadSuratHasil };
