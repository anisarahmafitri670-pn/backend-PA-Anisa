const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const KepalaCamatController = require('../controllers/kepalaCamatController');

router.get('/api/kepala-camat/test', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Kepala camat route versi baru aktif'
  });
});

router.get('/api/kepala-camat/dashboard', auth, authorizeRoles('kepala camat'), KepalaCamatController.dashboard);
router.get('/api/kepala-camat/laporan', auth, authorizeRoles('kepala camat'), KepalaCamatController.laporan);
router.get('/api/kepala-camat/laporan/:layanan/:id', auth, authorizeRoles('kepala camat'), KepalaCamatController.detailLaporan);

module.exports = router;
