const express = require('express');
const router = express.Router();
const RekomendasiSuratKerjaController = require('../controllers/rekomendasiSuratKerjaController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/uploadSuratKerja');
const { DokumenRekomendasiSuratKerjaController } = require('../controllers/dokumenRekomendasiSuratKerjaController');

// CRUD endpoint untuk rekomendasi surat kerja
router.post('/api/rekomendasi_surat_kerja', auth, RekomendasiSuratKerjaController.buatPengajuan);
router.get('/api/rekomendasi_surat_kerja', auth, RekomendasiSuratKerjaController.getAllPengajuan);
router.get('/api/rekomendasi_surat_kerja/:id', auth, RekomendasiSuratKerjaController.getPengajuanById);
router.put('/api/rekomendasi_surat_kerja/:id', auth, RekomendasiSuratKerjaController.updatePengajuan);
router.delete('/api/rekomendasi_surat_kerja/:id', auth, RekomendasiSuratKerjaController.hapusPengajuan);

// Upload dokumen persyaratan (PDF/PNG) untuk surat kerja
router.post(
  '/api/rekomendasi_surat_kerja/:id/dokumen',
  auth,
  upload.any(),
  DokumenRekomendasiSuratKerjaController.uploadDokumen
);

// Ambil daftar dokumen yang sudah diupload
router.get(
  '/api/rekomendasi_surat_kerja/:id/dokumen',
  auth,
  DokumenRekomendasiSuratKerjaController.listDokumen
);

module.exports = router;
