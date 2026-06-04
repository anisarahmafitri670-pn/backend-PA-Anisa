const express = require('express');
const router = express.Router();
const RekomendasiSuratYayasanController = require('../controllers/rekomendasiSuratYayasanController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/uploadSuratYayasan');
const { DokumenRekomendasiSuratYayasanController } = require('../controllers/dokumenRekomendasiSuratYayasanController');

// CRUD endpoint untuk rekomendasi surat yayasan
router.post('/api/rekomendasi_surat_yayasan', auth, RekomendasiSuratYayasanController.buatPengajuan);
router.get('/api/rekomendasi_surat_yayasan', auth, RekomendasiSuratYayasanController.getAllPengajuan);
router.get('/api/rekomendasi_surat_yayasan/:id', auth, RekomendasiSuratYayasanController.getPengajuanById);
router.put('/api/rekomendasi_surat_yayasan/:id', auth, RekomendasiSuratYayasanController.updatePengajuan);
router.delete('/api/rekomendasi_surat_yayasan/:id', auth, RekomendasiSuratYayasanController.hapusPengajuan);

// Upload dokumen persyaratan (PDF/PNG) untuk surat yayasan
router.post(
  '/api/rekomendasi_surat_yayasan/:id/dokumen',
  auth,
  upload.any(),
  DokumenRekomendasiSuratYayasanController.uploadDokumen
);

// Ambil daftar dokumen yang sudah diupload
router.get(
  '/api/rekomendasi_surat_yayasan/:id/dokumen',
  auth,
  DokumenRekomendasiSuratYayasanController.listDokumen
);

router.delete(
  '/api/rekomendasi_surat_yayasan/:id/dokumen/:jenis_dokumen',
  auth,
  DokumenRekomendasiSuratYayasanController.hapusDokumen
);

module.exports = router;
