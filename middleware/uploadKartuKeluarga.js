const { createDiskUpload, ALLOWED_MIME_TYPES } = require('./uploadFactory');

const upload = createDiskUpload('kartu_keluarga');

module.exports = { upload, ALLOWED_MIME_TYPES };


