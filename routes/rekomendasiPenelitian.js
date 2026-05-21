const express = require('express');
const router = express.Router();
const RekomendasiPenelitianController = require('../controllers/rekomendasiPenelitianController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/uploadPenelitian');
const { DokumenRekomendasiPenelitianController } = require('../controllers/dokumenRekomendasiPenelitianController');

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
  upload.fields([
    { name: 'ktp_mahasiswa', maxCount: 1 },
    { name: 'ktm_mahasiswa', maxCount: 1 },
    { name: 'surat_rekomendasi_riset_univ_kesbangpol', maxCount: 1 },
    // legacy support: jenis_dokumen + file
    { name: 'file', maxCount: 1 }
  ]),
  DokumenRekomendasiPenelitianController.uploadDokumen
);

// Ambil daftar dokumen yang sudah diupload
router.get(
  '/api/rekomendasi_penelitian/:id/dokumen',
  auth,
  DokumenRekomendasiPenelitianController.listDokumen
);

module.exports = router;
