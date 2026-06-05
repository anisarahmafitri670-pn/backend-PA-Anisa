const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const auth = require('../middleware/auth');
const ProfileController = require('../controllers/profileController');
const R = require('../utils/response');

const avatarDir = path.join(process.cwd(), 'uploads', 'avatar');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      fs.mkdirSync(avatarDir, { recursive: true });
      cb(null, avatarDir);
    } catch (error) {
      cb(error);
    }
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `avatar_${req.user.id_user}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Format avatar tidak didukung. Upload file gambar.'));
    }
    return cb(null, true);
  }
});

function uploadAvatar(req, res, next) {
  upload.single('avatar')(req, res, (error) => {
    if (error) {
      return R.badRequest(res, error.message);
    }
    return next();
  });
}

router.get('/', auth, ProfileController.getProfile);
router.put('/', auth, ProfileController.updateProfile);
router.put('/avatar', auth, uploadAvatar, ProfileController.updateAvatar);

module.exports = router;
