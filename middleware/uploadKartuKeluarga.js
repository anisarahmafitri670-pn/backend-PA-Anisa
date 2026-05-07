const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png']);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const idPengajuan = String(req.params.id || '').trim();
    const baseDir = path.join(process.cwd(), 'uploads', 'kartu_keluarga', idPengajuan);
    try {
      fs.mkdirSync(baseDir, { recursive: true });
      cb(null, baseDir);
    } catch (error) {
      cb(error);
    }
  },
  filename(req, file, cb) {
    const jenisDokumen = String(req.body.jenis_dokumen || '').trim();
    const ext = file.mimetype === 'application/pdf' ? '.pdf' : '.png';
    const safeJenis = jenisDokumen.replace(/[^a-zA-Z0-9_\\-]/g, '_');
    cb(null, `${safeJenis}_${Date.now()}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Format file tidak didukung. Hanya PDF dan PNG.'));
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = { upload, ALLOWED_MIME_TYPES };

