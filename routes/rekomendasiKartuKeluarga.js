const express = require('express');
const router = express.Router();
const RekomendasiKartuKeluargaController = require('../controllers/rekomendasiKartuKeluargaController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/uploadKartuKeluarga');
const { DokumenRekomendasiKartuKeluargaController } = require('../controllers/dokumenRekomendasiKartuKeluargaController');
const { registerPetugasRoutes } = require('./petugasRoutes');

// CRUD endpoint untuk rekomendasi kartu keluarga
router.post('/api/rekomendasi_kartu_keluarga', auth, RekomendasiKartuKeluargaController.buatPengajuan);
router.get('/api/rekomendasi_kartu_keluarga', auth, RekomendasiKartuKeluargaController.getAllPengajuan);
router.get('/api/rekomendasi_kartu_keluarga/:id', auth, RekomendasiKartuKeluargaController.getPengajuanById);
router.put('/api/rekomendasi_kartu_keluarga/:id', auth, RekomendasiKartuKeluargaController.updatePengajuan);
router.delete('/api/rekomendasi_kartu_keluarga/:id', auth, RekomendasiKartuKeluargaController.hapusPengajuan);

// Upload dokumen persyaratan (PDF/PNG) untuk kartu keluarga
router.post(
  '/api/rekomendasi_kartu_keluarga/:id/dokumen',
  auth,
  upload.any(),
  DokumenRekomendasiKartuKeluargaController.uploadDokumen
);

// Ambil daftar dokumen yang sudah diupload
router.get(
  '/api/rekomendasi_kartu_keluarga/:id/dokumen',
  auth,
  DokumenRekomendasiKartuKeluargaController.listDokumen
);

router.delete(
  '/api/rekomendasi_kartu_keluarga/:id/dokumen/:jenis_dokumen',
  auth,
  DokumenRekomendasiKartuKeluargaController.hapusDokumen
);

registerPetugasRoutes(router, 'rekomendasi_kartu_keluarga');

module.exports = router;
