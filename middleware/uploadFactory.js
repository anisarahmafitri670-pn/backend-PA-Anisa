const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png']);

function toSafeBaseName(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, 120);
}

function extFromMime(mimeType) {
  return mimeType === 'application/pdf' ? '.pdf' : '.png';
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Format file tidak didukung. Hanya PDF dan PNG.'));
  }
  return cb(null, true);
}

function createDiskUpload(jenisLayanan) {
  if (!jenisLayanan || typeof jenisLayanan !== 'string') {
    throw new Error('createDiskUpload membutuhkan jenisLayanan');
  }

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      const idPengajuan = String(req.params.id || '').trim();
      const baseDir = path.join(process.cwd(), 'uploads', jenisLayanan, idPengajuan);
      try {
        fs.mkdirSync(baseDir, { recursive: true });
        cb(null, baseDir);
      } catch (error) {
        cb(error);
      }
    },
    filename(req, file, cb) {
      const fieldName = String(file.fieldname || '').trim();
      const jenisDokumen =
        fieldName && fieldName !== 'file' ? fieldName : String(req.body.jenis_dokumen || '').trim();
      const safeJenis = toSafeBaseName(jenisDokumen || 'dokumen');
      const ext = extFromMime(file.mimetype);
      cb(null, `${safeJenis}_${Date.now()}${ext}`);
    }
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  });
}

module.exports = { createDiskUpload, ALLOWED_MIME_TYPES };

