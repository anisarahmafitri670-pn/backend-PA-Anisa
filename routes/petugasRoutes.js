const VerifikasiPetugasController = require('../controllers/verifikasiPetugasController');
const PengajuanStatusController = require('../controllers/pengajuanStatusController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const { uploadSuratHasil } = require('../middleware/uploadSuratHasil');

function setLayanan(layanan) {
  return (req, res, next) => {
    req.layanan = layanan;
    next();
  };
}

function registerPetugasRoutes(router, layanan) {
  const basePath = `/api/${layanan}/:id`;
  const layananMiddleware = setLayanan(layanan);
  const petugasOnly = authorizeRoles('petugas');

  router.get(`${basePath}`, auth, layananMiddleware, PengajuanStatusController.detail);
  router.put(`${basePath}/verifikasi`, auth, petugasOnly, layananMiddleware, VerifikasiPetugasController.verifikasi);
  router.put(`${basePath}/diproses`, auth, petugasOnly, layananMiddleware, VerifikasiPetugasController.diproses);
  router.put(`${basePath}/ditolak`, auth, petugasOnly, layananMiddleware, VerifikasiPetugasController.ditolak);
  router.patch(`${basePath}/status`, auth, petugasOnly, layananMiddleware, PengajuanStatusController.updateStatus);
  router.post(
    `${basePath}/surat-hasil`,
    auth,
    petugasOnly,
    layananMiddleware,
    uploadSuratHasil,
    PengajuanStatusController.uploadSuratHasil
  );
  router.delete(`${basePath}/surat-hasil`, auth, petugasOnly, layananMiddleware, PengajuanStatusController.deleteSuratHasil);
  router.put(`${basePath}/selesai`, auth, petugasOnly, layananMiddleware, VerifikasiPetugasController.selesai);
}

module.exports = { registerPetugasRoutes };
