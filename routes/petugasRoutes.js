const VerifikasiPetugasController = require('../controllers/verifikasiPetugasController');
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

  router.put(`${basePath}/verifikasi`, auth, petugasOnly, layananMiddleware, VerifikasiPetugasController.verifikasi);
  router.put(`${basePath}/diproses`, auth, petugasOnly, layananMiddleware, VerifikasiPetugasController.diproses);
  router.put(`${basePath}/ditolak`, auth, petugasOnly, layananMiddleware, VerifikasiPetugasController.ditolak);
  router.post(
    `${basePath}/surat-hasil`,
    auth,
    petugasOnly,
    layananMiddleware,
    uploadSuratHasil,
    VerifikasiPetugasController.uploadSuratHasil
  );
  router.put(`${basePath}/selesai`, auth, petugasOnly, layananMiddleware, VerifikasiPetugasController.selesai);
}

module.exports = { registerPetugasRoutes };
