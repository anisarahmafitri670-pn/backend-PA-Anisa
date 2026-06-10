const express = require('express');
const router = express.Router();
const RekomendasiPenelitianController = require('../controllers/rekomendasiPenelitianController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/uploadPenelitian');
const { DokumenRekomendasiPenelitianController } = require('../controllers/dokumenRekomendasiPenelitianController');
const { registerPetugasRoutes } = require('./petugasRoutes');

// CRUD endpoint untuk rekomendasi penelitian
router.post('/api/rekomendasi_penelitian', auth, RekomendasiPenelitianController.buatRekomendasi);
router.get('/api/rekomendasi_penelitian', auth, RekomendasiPenelitianController.getAllRekomendasi);
router.get('/api/rekomendasi_penelitian/:id', auth, RekomendasiPenelitianController.getRekomendasiById);
router.put('/api/rekomendasi_penelitian/:id', auth, RekomendasiPenelitianController.updateRekomendasi);
router.delete('/api/rekomendasi_penelitian/:id', auth, RekomendasiPenelitianController.hapusRekomendasi);

// Upload dokumen persyaratan (PDF/PNG) untuk penelitian
router.post(
  '/api/rekomendasi_penelitian/:id/dokumen',
  auth,
  upload.any(),
  DokumenRekomendasiPenelitianController.uploadDokumen
);

// Ambil daftar dokumen yang sudah diupload
router.get(
  '/api/rekomendasi_penelitian/:id/dokumen',
  auth,
  DokumenRekomendasiPenelitianController.listDokumen
);

router.delete(
  '/api/rekomendasi_penelitian/:id/dokumen/:jenis_dokumen',
  auth,
  DokumenRekomendasiPenelitianController.hapusDokumen
);

registerPetugasRoutes(router, 'rekomendasi_penelitian');

module.exports = router;
