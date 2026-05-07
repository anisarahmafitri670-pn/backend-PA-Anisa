const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const R = require('../utils/response');

const ALLOWED_ROLES = new Set(['masyarakat', 'petugas', 'kepala_camat']);

function normalizeUsername(username) {
  return (username || '').trim();
}

function isValidUsername(username) {
  // minimal 8 karakter, harus ada huruf kapital dan angka
  // allowed: huruf (besar/kecil), angka, underscore, titik
  return /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d_.]{8,30}$/.test(username);
}

function isValidPassword(password) {
  // minimal 8 karakter, harus ada huruf kapital dan angka, tidak boleh mengandung spasi
  return /^(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/.test(password);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getJwtConfig() {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  if (!secret || secret.trim() === '' || secret === 'change-me') {
    return {
      success: false,
      error: 'JWT_SECRET belum diset. Isi JWT_SECRET di file .env'
    };
  }

  return { success: true, secret, expiresIn };
}

class AuthController {
  static async register(req, res) {
    try {
      const namaLengkap = (req.body.nama_lengkap || req.body.nama || '').trim();
      const username = normalizeUsername(req.body.username);
      const email = (req.body.email || '').trim().toLowerCase();
      const password = req.body.password || '';

      if (!namaLengkap) {
        return R.badRequest(res, 'nama_lengkap tidak boleh kosong');
      }

      if (!username || !isValidUsername(username)) {
        return R.badRequest(res, 'username tidak valid (min 8 karakter, harus ada huruf kapital dan angka)');
      }

      if (!email || !isValidEmail(email)) {
        return R.badRequest(res, 'email tidak valid');
      }

      if (!password) {
        return R.badRequest(res, 'password tidak boleh kosong');
      }

      if (!isValidPassword(password)) {
        return R.badRequest(res, 'password tidak valid (min 8 karakter, harus ada huruf kapital dan angka)');
      }

      const existingUsername = await UserModel.findByUsername(username);
      if (!existingUsername.success) {
        return R.serverError(res, 'Gagal cek user');
      }
      if (existingUsername.data) {
        return res.status(409).json({ success: false, message: 'Username sudah digunakan' });
      }

      const existingEmail = await UserModel.findByEmail(email);
      if (!existingEmail.success) {
        return R.serverError(res, 'Gagal cek user');
      }
      if (existingEmail.data) {
        return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const role = 'masyarakat';

      const created = await UserModel.createUser({ nama: namaLengkap, username, email, passwordHash, role });
      if (!created.success) {
        return R.serverError(res, 'Gagal membuat user');
      }

      return R.created(res, 'Register berhasil', { id_user: created.id, nama_lengkap: namaLengkap, username, email, role });
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async login(req, res) {
    try {
      const username = normalizeUsername(req.body.username);
      const password = req.body.password || '';

      if (!username || !isValidUsername(username)) {
        return R.badRequest(res, 'username tidak valid (min 8 karakter, harus ada huruf kapital dan angka)');
      }

      if (!password || !isValidPassword(password)) {
        return R.badRequest(res, 'password tidak valid (min 8 karakter, harus ada huruf kapital dan angka)');
      }

      const jwtConfig = getJwtConfig();
      if (!jwtConfig.success) {
        return R.serverError(res, jwtConfig.error);
      }

      const result = await UserModel.findByUsername(username);
      if (!result.success) {
        return R.serverError(res, 'Gagal cek user');
      }

      const user = result.data;
      if (!user) {
        return R.unauthorized(res, 'Username atau password salah');
      }

      if (!ALLOWED_ROLES.has(user.role)) {
        // Tidak menggunakan helper forbidden sesuai permintaan. Tetap standar: success + message.
        return res.status(403).json({ success: false, message: 'Role user tidak valid' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return R.unauthorized(res, 'Username atau password salah');
      }

      const payload = { id_user: user.id_user, username: user.username, role: user.role };
      const accessToken = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

      const namaLengkap = (user.nama_lengkap || user.nama || '').trim();

      return R.ok(res, 'Login berhasil', {
        accessToken,
        user: {
          id_user: user.id_user,
          nama_lengkap: namaLengkap,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = AuthController;
