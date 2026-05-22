const { createDiskUpload, ALLOWED_MIME_TYPES } = require('./uploadFactory');

const upload = createDiskUpload('penelitian');

module.exports = { upload, ALLOWED_MIME_TYPES };

