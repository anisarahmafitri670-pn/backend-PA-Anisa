const { createDiskUpload, ALLOWED_MIME_TYPES } = require('./uploadFactory');

const upload = createDiskUpload('surat_ahli_waris');

module.exports = { upload, ALLOWED_MIME_TYPES };

