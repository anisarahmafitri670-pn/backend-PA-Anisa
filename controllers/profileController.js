const ProfileModel = require('../models/profileModel');
const R = require('../utils/response');

function getTokenUserId(req) {
  return req.user && req.user.id_user ? Number(req.user.id_user) : null;
}

class ProfileController {
  static async getProfile(req, res) {
    try {
      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const result = await ProfileModel.findById(idUser);
      if (result.success && result.data) {
        return R.ok(res, 'Berhasil mengambil data profile', result.data);
      }

      if (result.success && !result.data) {
        return R.notFound(res, 'User tidak ditemukan');
      }

      return R.serverError(res, 'Gagal mengambil data profile');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async updateProfile(req, res) {
    try {
      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const namaLengkap = (req.body.nama_lengkap || '').trim();
      const username = (req.body.username || '').trim();
      const noHp = (req.body.no_hp || '').trim();
      const alamat = (req.body.alamat || '').trim();
      const errors = [];

      if (!namaLengkap) {
        errors.push('nama_lengkap tidak boleh kosong');
      }

      if (!username) {
        errors.push('username tidak boleh kosong');
      }

      if (errors.length > 0) {
        return R.badRequest(res, 'Validasi gagal', errors);
      }

      const result = await ProfileModel.updateProfile(idUser, {
        nama_lengkap: namaLengkap,
        username,
        no_hp: noHp || null,
        alamat: alamat || null
      });

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Profile berhasil diperbarui', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'User tidak ditemukan');
      }

      return R.serverError(res, 'Gagal memperbarui profile');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async updateAvatar(req, res) {
    try {
      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      if (!req.file) {
        return R.badRequest(res, 'avatar wajib diupload');
      }

      const avatarPath = `/uploads/avatar/${req.file.filename}`;
      const result = await ProfileModel.updateAvatar(idUser, avatarPath);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Avatar berhasil diperbarui', { avatar: avatarPath });
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'User tidak ditemukan');
      }

      return R.serverError(res, 'Gagal memperbarui avatar');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = ProfileController;
