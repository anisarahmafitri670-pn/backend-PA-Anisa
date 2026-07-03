const express = require('express');
const router = express.Router();
const GaleriController = require('../controllers/galeriController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const { uploadGaleri } = require('../middleware/uploadGaleri');

const petugasOnly = authorizeRoles('petugas');

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader) return next();
  return auth(req, res, next);
}

function handleSingleUpload(fieldName) {
  return (req, res, next) => {
    uploadGaleri.single(fieldName)(req, res, (error) => {
      if (error) {
        const message = error.code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran file maksimal 5 MB'
          : error.message;

        return res.status(400).json({
          success: false,
          message,
          errors: [message]
        });
      }

      return next();
    });
  };
}

// Public
router.get('/api/galeri', GaleriController.getAllGaleri);

// Admin/Petugas
router.get('/api/galeri/admin/all', auth, petugasOnly, GaleriController.getAllGaleriAdmin);
router.get('/api/galeri/admin/semua', auth, petugasOnly, GaleriController.getAllGaleriAdmin);
router.post('/api/galeri', auth, petugasOnly, handleSingleUpload('foto'), GaleriController.createGaleri);
router.put('/api/galeri/:id', auth, petugasOnly, handleSingleUpload('foto'), GaleriController.updateGaleri);
router.patch('/api/galeri/:id/status', auth, petugasOnly, GaleriController.updateStatusGaleri);
router.delete('/api/galeri/:id', auth, petugasOnly, GaleriController.deleteGaleri);
router.get('/api/galeri/:id', optionalAuth, GaleriController.getGaleriById);

module.exports = router;
