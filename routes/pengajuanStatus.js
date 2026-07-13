const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const { uploadSuratHasil } = require('../middleware/uploadSuratHasil');
const PengajuanStatusController = require('../controllers/pengajuanStatusController');

const petugasOnly = authorizeRoles('petugas');

router.get('/api/pengajuan/:id', auth, PengajuanStatusController.detail);
router.get('/api/pengajuan/:layanan/:id', auth, PengajuanStatusController.detail);

router.patch('/api/pengajuan/:id/status', auth, petugasOnly, PengajuanStatusController.updateStatus);
router.patch('/api/pengajuan/:layanan/:id/status', auth, petugasOnly, PengajuanStatusController.updateStatus);

router.post('/api/pengajuan/:id/surat-hasil', auth, petugasOnly, uploadSuratHasil, PengajuanStatusController.uploadSuratHasil);
router.post('/api/pengajuan/:layanan/:id/surat-hasil', auth, petugasOnly, uploadSuratHasil, PengajuanStatusController.uploadSuratHasil);

router.delete('/api/pengajuan/:id/surat-hasil', auth, petugasOnly, PengajuanStatusController.deleteSuratHasil);
router.delete('/api/pengajuan/:layanan/:id/surat-hasil', auth, petugasOnly, PengajuanStatusController.deleteSuratHasil);

module.exports = router;
