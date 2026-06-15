const GaleriModel = require('../models/galeriModel');
const R = require('../utils/response');

function getTokenUserId(req) {
  return req.user && req.user.id_user ? Number(req.user.id_user) : null;
}

function isPetugas(req) {
  return req.user && ['petugas', 'kepala_camat'].includes(req.user.role);
}

function normalizeStatus(value) {
  const status = String(value || 'publish').trim().toLowerCase();
  return status === 'draft' ? 'draft' : 'publish';
}

function buildImagePath(filename) {
  return `/uploads/galeri/${filename}`;
}

class GaleriController {
  static validateInput(data, isUpdate = false) {
    const errors = [];

    if (!data.judul || data.judul.trim() === '') {
      errors.push('judul tidak boleh kosong');
    }

    if (!isUpdate && !data.gambar) {
      errors.push('gambar tidak boleh kosong');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async getAllGaleri(req, res) {
    try {
      const result = await GaleriModel.getAllGaleriPublik();
      if (result.success) {
        return R.ok(res, 'Berhasil mengambil data galeri', result.data);
      }

      return R.serverError(res, 'Gagal mengambil data galeri');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async getGaleriById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID galeri tidak valid');
      }

      const result = await GaleriModel.getGaleriByIdPublik(id);
      if (result.success && result.data) {
        return R.ok(res, 'Berhasil mengambil data galeri', result.data);
      }

      if (result.success && !result.data) {
        return R.notFound(res, 'Galeri tidak ditemukan');
      }

      return R.serverError(res, 'Gagal mengambil data galeri');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async getAllGaleriAdmin(req, res) {
    try {
      const result = await GaleriModel.getAllGaleriAdmin();
      if (result.success) {
        return R.ok(res, 'Berhasil mengambil data galeri', result.data);
      }

      return R.serverError(res, 'Gagal mengambil data galeri');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async createGaleri(req, res) {
    try {
      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      if (!req.file) {
        return R.badRequest(res, 'gambar tidak boleh kosong');
      }

      const validation = GaleriController.validateInput(req.body, false);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const galeriData = {
        id_user: idUser,
        judul: req.body.judul.trim(),
        deskripsi: String(req.body.deskripsi || '').trim() || null,
        gambar: buildImagePath(req.file.filename),
        status: normalizeStatus(req.body.status)
      };

      const result = await GaleriModel.createGaleri(galeriData);
      if (result.success) {
        return R.created(res, 'Galeri berhasil dibuat', {
          id_galeri: result.id,
          ...galeriData
        });
      }

      return R.serverError(res, 'Gagal menyimpan galeri ke database');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async updateGaleri(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID galeri tidak valid');
      }

      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const payload = {};

      if (typeof req.body.judul !== 'undefined') {
        if (String(req.body.judul).trim() === '') {
          return R.badRequest(res, 'judul tidak boleh kosong');
        }
        payload.judul = String(req.body.judul).trim();
      }

      if (typeof req.body.deskripsi !== 'undefined') {
        payload.deskripsi = String(req.body.deskripsi).trim() || null;
      }

      if (typeof req.body.status !== 'undefined') {
        payload.status = normalizeStatus(req.body.status);
      }

      if (req.file) {
        payload.gambar = buildImagePath(req.file.filename);
      }

      if (Object.keys(payload).length === 0) {
        return R.badRequest(res, 'Tidak ada data yang diupdate');
      }

      const result = await GaleriModel.updateGaleri(id, payload);
      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Galeri berhasil diperbarui', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Galeri tidak ditemukan');
      }

      return R.serverError(res, 'Gagal memperbarui galeri');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async deleteGaleri(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID galeri tidak valid');
      }

      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const result = await GaleriModel.deleteGaleri(id);
      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Galeri berhasil dihapus', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Galeri tidak ditemukan');
      }

      return R.serverError(res, 'Gagal menghapus galeri');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = GaleriController;
