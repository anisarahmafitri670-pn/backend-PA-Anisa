const express = require('express');
const router = express.Router();
const RekomendasiSuratPindahController = require('../controllers/rekomendasiSuratPindahController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/uploadSuratPindah');
const { DokumenRekomendasiSuratPindahController } = require('../controllers/dokumenRekomendasiSuratPindahController');
const { registerPetugasRoutes } = require('./petugasRoutes');

// CRUD endpoint untuk rekomendasi surat pindah
router.post('/api/rekomendasi_surat_pindah', auth, RekomendasiSuratPindahController.buatPengajuan);
router.get('/api/rekomendasi_surat_pindah', auth, RekomendasiSuratPindahController.getAllPengajuan);
router.get('/api/rekomendasi_surat_pindah/:id', auth, RekomendasiSuratPindahController.getPengajuanById);
router.put('/api/rekomendasi_surat_pindah/:id', auth, RekomendasiSuratPindahController.updatePengajuan);
router.delete('/api/rekomendasi_surat_pindah/:id', auth, RekomendasiSuratPindahController.hapusPengajuan);

// Upload dokumen persyaratan (PDF/PNG) untuk surat pindah
router.post(
  '/api/rekomendasi_surat_pindah/:id/dokumen',
  auth,
  upload.any(),
  DokumenRekomendasiSuratPindahController.uploadDokumen
);

// Ambil daftar dokumen yang sudah diupload
router.get(
  '/api/rekomendasi_surat_pindah/:id/dokumen',
  auth,
  DokumenRekomendasiSuratPindahController.listDokumen
);

router.delete(
  '/api/rekomendasi_surat_pindah/:id/dokumen/:jenis_dokumen',
  auth,
  DokumenRekomendasiSuratPindahController.hapusDokumen
);

registerPetugasRoutes(router, 'rekomendasi_surat_pindah');

module.exports = router;
