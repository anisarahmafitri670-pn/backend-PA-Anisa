const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const KepalaCamatController = require('../controllers/kepalaCamatController');

router.get('/api/kepala-camat/dashboard', auth, authorizeRoles('kepala camat'), KepalaCamatController.dashboard);

module.exports = router;
