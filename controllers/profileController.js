const ProfileModel = require('../models/profileModel');
const R = require('../utils/response');
const fs = require('fs');
const path = require('path');

function getTokenUserId(req) {
  return req.user && req.user.id_user ? Number(req.user.id_user) : null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function removeFileIfExists(filePath) {
  if (!filePath) {
    return;
  }

  const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const absolutePath = path.join(process.cwd(), normalizedPath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
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
      const email = (req.body.email || '').trim().toLowerCase();
      const noHp = (req.body.no_hp || '').trim();
      const alamat = (req.body.alamat || '').trim();
      const role = (req.body.role || '').trim();
      const errors = [];

      if (!namaLengkap) {
        errors.push('nama_lengkap tidak boleh kosong');
      }

      if (!username) {
        errors.push('username tidak boleh kosong');
      }

      if (!email) {
        errors.push('email tidak boleh kosong');
      } else if (!isValidEmail(email)) {
        errors.push('email tidak valid');
      }

      if (errors.length > 0) {
        return R.badRequest(res, 'Validasi gagal', errors);
      }

      const currentProfile = await ProfileModel.findById(idUser);
      if (!currentProfile.success) {
        return R.serverError(res, 'Gagal mengambil data profile saat ini');
      }

      if (!currentProfile.data) {
        return R.notFound(res, 'User tidak ditemukan');
      }

      const updateData = {
        nama_lengkap: namaLengkap,
        username,
        email,
        no_hp: noHp || null,
        alamat: alamat || null,
        role: role || currentProfile.data.role
      };

      if (req.file) {
        updateData.avatar = `/uploads/avatar/${req.file.filename}`;
      }

      const result = await ProfileModel.updateProfile(idUser, updateData);

      if (result.success && result.affectedRows > 0) {
        const updatedProfile = await ProfileModel.findById(idUser);
        if (updatedProfile.success && updatedProfile.data) {
          if (req.file && currentProfile.data.avatar && currentProfile.data.avatar !== updatedProfile.data.avatar) {
            removeFileIfExists(currentProfile.data.avatar);
          }
          return R.ok(res, 'Profil berhasil diperbarui', updatedProfile.data);
        }

        return R.serverError(res, 'Profil berhasil diperbarui, tetapi gagal mengambil data terbaru');
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'User tidak ditemukan');
      }

      console.error('Update profile error:', result.error);
      return R.serverError(res, result.error || 'Gagal memperbarui profil');
    } catch (error) {
      console.error('Update profile exception:', error);
      return R.serverError(res, error.message || 'Terjadi kesalahan pada server');
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

      const currentProfile = await ProfileModel.findById(idUser);
      if (!currentProfile.success) {
        return R.serverError(res, 'Gagal mengambil data profile saat ini');
      }

      if (!currentProfile.data) {
        return R.notFound(res, 'User tidak ditemukan');
      }

      const avatarPath = `/uploads/avatar/${req.file.filename}`;
      const result = await ProfileModel.updateAvatar(idUser, avatarPath);

      if (result.success && result.affectedRows > 0) {
        if (currentProfile.data.avatar && currentProfile.data.avatar !== avatarPath) {
          removeFileIfExists(currentProfile.data.avatar);
        }

        const updatedProfile = await ProfileModel.findById(idUser);
        if (updatedProfile.success && updatedProfile.data) {
          return R.ok(res, 'Avatar berhasil diperbarui', updatedProfile.data);
        }

        return R.ok(res, 'Avatar berhasil diperbarui', { avatar: avatarPath });
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'User tidak ditemukan');
      }

      console.error('Update avatar error:', result.error);
      return R.serverError(res, result.error || 'Gagal memperbarui avatar');
    } catch (error) {
      console.error('Update avatar exception:', error);
      return R.serverError(res, error.message || 'Terjadi kesalahan pada server');
    }
  }

  static async deleteAvatar(req, res) {
    try {
      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const currentProfile = await ProfileModel.findById(idUser);
      if (!currentProfile.success) {
        return R.serverError(res, 'Gagal mengambil data profile saat ini');
      }

      if (!currentProfile.data) {
        return R.notFound(res, 'User tidak ditemukan');
      }

      const oldAvatar = currentProfile.data.avatar;
      if (oldAvatar) {
        removeFileIfExists(oldAvatar);
      }

      const result = await ProfileModel.deleteAvatar(idUser);

      if (result.success && result.affectedRows > 0) {
        const updatedProfile = await ProfileModel.findById(idUser);
        if (updatedProfile.success && updatedProfile.data) {
          return R.ok(res, 'Foto profil berhasil dihapus', updatedProfile.data);
        }

        return R.ok(res, 'Foto profil berhasil dihapus', { avatar: null });
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'User tidak ditemukan');
      }

      return R.serverError(res, 'Gagal menghapus foto profil');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = ProfileController;
