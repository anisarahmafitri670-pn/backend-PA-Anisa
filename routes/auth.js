const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const UserLoginHistoryController = require('../controllers/userLoginHistoryController');
const auth = require('../middleware/auth');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', auth, UserLoginHistoryController.logout);

module.exports = router;
