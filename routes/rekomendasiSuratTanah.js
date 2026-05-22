const express = require('express');
const router = express.Router();
const RekomendasiSuratTanahController = require('../controllers/rekomendasiSuratTanahController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/uploadSuratTanah');
const { DokumenRekomendasiSuratTanahController } = require('../controllers/dokumenRekomendasiSuratTanahController');

// CRUD endpoint untuk rekomendasi surat tanah
router.post('/api/rekomendasi_surat_tanah', auth, RekomendasiSuratTanahController.buatPengajuan);
router.get('/api/rekomendasi_surat_tanah', auth, RekomendasiSuratTanahController.getAllPengajuan);
router.get('/api/rekomendasi_surat_tanah/:id', auth, RekomendasiSuratTanahController.getPengajuanById);
router.put('/api/rekomendasi_surat_tanah/:id', auth, RekomendasiSuratTanahController.updatePengajuan);
router.delete('/api/rekomendasi_surat_tanah/:id', auth, RekomendasiSuratTanahController.hapusPengajuan);

// Upload dokumen persyaratan (PDF/PNG) untuk surat tanah
router.post(
  '/api/rekomendasi_surat_tanah/:id/dokumen',
  auth,
  upload.any(),
  DokumenRekomendasiSuratTanahController.uploadDokumen
);

// Ambil daftar dokumen yang sudah diupload
router.get(
  '/api/rekomendasi_surat_tanah/:id/dokumen',
  auth,
  DokumenRekomendasiSuratTanahController.listDokumen
);

module.exports = router;
