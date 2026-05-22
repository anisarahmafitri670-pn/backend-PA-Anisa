const express = require('express');
const router = express.Router();
const RekomendasiSuratAhliWarisController = require('../controllers/rekomendasiSuratAhliWarisController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/uploadSuratAhliWaris');
const { DokumenRekomendasiSuratAhliWarisController } = require('../controllers/dokumenRekomendasiSuratAhliWarisController');

// CRUD endpoint untuk rekomendasi surat ahli waris
router.post('/api/rekomendasi_surat_ahli_waris', auth, RekomendasiSuratAhliWarisController.buatPengajuan);
router.get('/api/rekomendasi_surat_ahli_waris', auth, RekomendasiSuratAhliWarisController.getAllPengajuan);
router.get('/api/rekomendasi_surat_ahli_waris/:id', auth, RekomendasiSuratAhliWarisController.getPengajuanById);
router.put('/api/rekomendasi_surat_ahli_waris/:id', auth, RekomendasiSuratAhliWarisController.updatePengajuan);
router.delete('/api/rekomendasi_surat_ahli_waris/:id', auth, RekomendasiSuratAhliWarisController.hapusPengajuan);

// Upload dokumen persyaratan (PDF/PNG) untuk surat ahli waris
router.post(
  '/api/rekomendasi_surat_ahli_waris/:id/dokumen',
  auth,
  upload.any(),
  DokumenRekomendasiSuratAhliWarisController.uploadDokumen
);

// Ambil daftar dokumen yang sudah diupload
router.get(
  '/api/rekomendasi_surat_ahli_waris/:id/dokumen',
  auth,
  DokumenRekomendasiSuratAhliWarisController.listDokumen
);

module.exports = router;
