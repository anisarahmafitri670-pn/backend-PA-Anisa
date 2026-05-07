const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// CRUD minimal untuk pengguna (hapus user)
router.delete('/api/users/:id', UserController.hapusUser);

module.exports = router;

