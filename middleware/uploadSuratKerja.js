const { createDiskUpload, ALLOWED_MIME_TYPES } = require('./uploadFactory');

const upload = createDiskUpload('surat_kerja');

module.exports = { upload, ALLOWED_MIME_TYPES };
