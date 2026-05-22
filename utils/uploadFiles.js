const fs = require('fs');
const path = require('path');

function toPosixRelative(absPath) {
  const relativePath = path.relative(process.cwd(), absPath);
  return relativePath.split(path.sep).join('/');
}

function resolveUploadsPath(relativePath) {
  const uploadsRoot = path.resolve(process.cwd(), 'uploads');
  const absolutePath = path.resolve(process.cwd(), relativePath);

  if (!absolutePath.startsWith(uploadsRoot + path.sep) && absolutePath !== uploadsRoot) {
    return null;
  }

  return absolutePath;
}

function safeUnlinkRelativeUpload(relativePath) {
  const absolutePath = resolveUploadsPath(relativePath);
  if (!absolutePath) return;
  try {
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  } catch (_) {
    // ignore
  }
}

module.exports = { toPosixRelative, safeUnlinkRelativeUpload };

