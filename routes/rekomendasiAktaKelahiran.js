const express = require('express');
const router = express.Router();
const RekomendasiAktaKelahiranController = require('../controllers/rekomendasiAktaKelahiranController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/uploadAktaKelahiran');
const { DokumenRekomendasiAktaKelahiranController } = require('../controllers/dokumenRekomendasiAktaKelahiranController');
const { registerPetugasRoutes } = require('./petugasRoutes');

// CRUD endpoint untuk rekomendasi akta kelahiran
router.post('/api/rekomendasi_akta_kelahiran', auth, RekomendasiAktaKelahiranController.buatPengajuan);
router.get('/api/rekomendasi_akta_kelahiran', auth, RekomendasiAktaKelahiranController.getAllPengajuan);
router.get('/api/rekomendasi_akta_kelahiran/:id', auth, RekomendasiAktaKelahiranController.getPengajuanById);
router.put('/api/rekomendasi_akta_kelahiran/:id', auth, RekomendasiAktaKelahiranController.updatePengajuan);
router.delete('/api/rekomendasi_akta_kelahiran/:id', auth, RekomendasiAktaKelahiranController.hapusPengajuan);

// Upload dokumen persyaratan (PDF/PNG) untuk akta kelahiran
router.post(
  '/api/rekomendasi_akta_kelahiran/:id/dokumen',
  auth,
  upload.any(),
  DokumenRekomendasiAktaKelahiranController.uploadDokumen
);

// Ambil daftar dokumen yang sudah diupload
router.get(
  '/api/rekomendasi_akta_kelahiran/:id/dokumen',
  auth,
  DokumenRekomendasiAktaKelahiranController.listDokumen
);

router.delete(
  '/api/rekomendasi_akta_kelahiran/:id/dokumen/:jenis_dokumen',
  auth,
  DokumenRekomendasiAktaKelahiranController.hapusDokumen
);

registerPetugasRoutes(router, 'rekomendasi_akta_kelahiran');

module.exports = router;
