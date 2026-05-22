const { createDiskUpload, ALLOWED_MIME_TYPES } = require('./uploadFactory');

const upload = createDiskUpload('akta_kelahiran');

module.exports = { upload, ALLOWED_MIME_TYPES };
