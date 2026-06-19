const express = require('express');
const router = express.Router();
const GaleriController = require('../controllers/galeriController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const { uploadGaleri } = require('../middleware/uploadGaleri');

const petugasOnly = authorizeRoles('petugas', 'kepala camat');

function handleSingleUpload(fieldName) {
  return (req, res, next) => {
    uploadGaleri.single(fieldName)(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return next();
    });
  };
}

// Public
router.get('/api/galeri', GaleriController.getAllGaleri);
router.get('/api/galeri/:id', GaleriController.getGaleriById);

// Admin/Petugas
router.get('/api/galeri/admin/semua', auth, petugasOnly, GaleriController.getAllGaleriAdmin);
router.post('/api/galeri', auth, petugasOnly, handleSingleUpload('gambar'), GaleriController.createGaleri);
router.put('/api/galeri/:id', auth, petugasOnly, handleSingleUpload('gambar'), GaleriController.updateGaleri);
router.delete('/api/galeri/:id', auth, petugasOnly, GaleriController.deleteGaleri);

module.exports = router;
