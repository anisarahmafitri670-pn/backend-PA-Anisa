const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png']);

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Format file tidak didukung. Hanya PDF dan PNG.'));
  }
  return cb(null, true);
}

function uploadToCloudinary(buffer, folder, resourceType, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        ...(publicId ? { public_id: publicId, overwrite: true } : {}),
        resource_type: resourceType,
        use_filename: false,
        unique_filename: false
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = { upload, uploadToCloudinary, ALLOWED_MIME_TYPES };
