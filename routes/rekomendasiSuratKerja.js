const express = require('express');
const router = express.Router();
const RekomendasiSuratKerjaController = require('../controllers/rekomendasiSuratKerjaController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/uploadSuratKerja');
const { DokumenRekomendasiSuratKerjaController } = require('../controllers/dokumenRekomendasiSuratKerjaController');
const { registerPetugasRoutes } = require('./petugasRoutes');

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

router.delete(
  '/api/rekomendasi_surat_kerja/:id/dokumen/:jenis_dokumen',
  auth,
  DokumenRekomendasiSuratKerjaController.hapusDokumen
);

registerPetugasRoutes(router, 'rekomendasi_surat_kerja');

module.exports = router;

