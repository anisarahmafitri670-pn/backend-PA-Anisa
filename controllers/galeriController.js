const GaleriModel = require('../models/galeriModel');
const R = require('../utils/response');
const { safeUnlinkRelativeUpload } = require('../utils/uploadFiles');

const TIPE_TAMPILAN = new Set(['hero', 'card']);

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

function getTokenUserId(req) {
  return req.user?.id_user ? Number(req.user.id_user) : null;
}

function isPetugas(req) {
  return String(req.user?.role || '').trim().toLowerCase() === 'petugas';
}

function buildFotoPath(filename) {
  return `/uploads/galeri/${filename}`;
}

function toRelativeUploadPath(fotoUrl) {
  return String(fotoUrl || '').replace(/^\/+/, '');
}

function normalizeOptionalText(value) {
  const text = String(value || '').trim();
  return text || null;
}

function normalizeDate(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  return text;
}

function normalizeInteger(value, defaultValue = 0) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return Number.parseInt(value, 10);
}

function normalizeStatusAktif(value, defaultValue = 1) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return Number(value) === 1 || value === true || value === 'true' ? 1 : 0;
}

class GaleriController {
  static validateInput(body, options = {}) {
    const errors = [];
    const isCreate = options.isCreate === true;
    const data = {};

    if (isCreate || body.judul !== undefined) {
      data.judul = String(body.judul || '').trim();
      if (data.judul.length < 3) {
        errors.push('judul minimal 3 karakter');
      }
    }

    if (isCreate || body.deskripsi_singkat !== undefined) {
      data.deskripsi_singkat = String(body.deskripsi_singkat || '').trim();
      if (data.deskripsi_singkat.length < 10) {
        errors.push('deskripsi_singkat minimal 10 karakter');
      }
    }

    if (isCreate || body.deskripsi_detail !== undefined) {
      data.deskripsi_detail = String(body.deskripsi_detail || '').trim();
      if (data.deskripsi_detail.length < 10) {
        errors.push('deskripsi_detail minimal 10 karakter');
      }
    }

    if (isCreate || body.tanggal_kegiatan !== undefined) {
      data.tanggal_kegiatan = normalizeDate(body.tanggal_kegiatan);
    }

    if (isCreate || body.lokasi !== undefined) {
      data.lokasi = normalizeOptionalText(body.lokasi);
    }

    if (isCreate || body.tipe_tampilan !== undefined) {
      data.tipe_tampilan = String(body.tipe_tampilan || 'card').trim().toLowerCase();
      if (!TIPE_TAMPILAN.has(data.tipe_tampilan)) {
        errors.push('tipe_tampilan hanya boleh hero atau card');
      }
    }

    if (isCreate || body.urutan_tampil !== undefined) {
      data.urutan_tampil = normalizeInteger(body.urutan_tampil, 0);
      if (!Number.isInteger(data.urutan_tampil) || data.urutan_tampil < 0) {
        errors.push('urutan_tampil harus berupa integer minimal 0');
      }
    }

    if (isCreate || body.status_aktif !== undefined) {
      data.status_aktif = normalizeStatusAktif(body.status_aktif, 1);
    }

    return {
      isValid: errors.length === 0,
      errors,
      data
    };
  }

  static async getAllGaleri(req, res) {
    try {
      const tipeTampilan = String(req.query.tipe_tampilan || '').trim().toLowerCase();
      if (tipeTampilan && !TIPE_TAMPILAN.has(tipeTampilan)) {
        return R.badRequest(res, 'Validasi gagal', ['tipe_tampilan hanya boleh hero atau card']);
      }

      const data = await GaleriModel.getPublicGaleri(tipeTampilan || null);
      return R.ok(res, 'Data galeri berhasil diambil', data);
    } catch (error) {
      console.error('getAllGaleri error:', error);
      return R.serverError(res, 'Gagal mengambil data galeri');
    }
  }

  static async getAllGaleriAdmin(req, res) {
    try {
      const data = await GaleriModel.getAllAdmin();
      return R.ok(res, 'Data galeri admin berhasil diambil', data);
    } catch (error) {
      console.error('getAllGaleriAdmin error:', error);
      return R.serverError(res, 'Gagal mengambil data galeri admin');
    }
  }

  static async getGaleriById(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return R.badRequest(res, 'ID galeri tidak valid');
      }

      const data = await GaleriModel.getById(id);
      if (!data) {
        return R.notFound(res, 'Galeri tidak ditemukan');
      }

      if (!data.status_aktif && !isPetugas(req)) {
        return R.notFound(res, 'Galeri tidak ditemukan');
      }

      return R.ok(res, 'Detail galeri berhasil diambil', data);
    } catch (error) {
      console.error('getGaleriById error:', error);
      return R.serverError(res, 'Gagal mengambil detail galeri');
    }
  }

  static async createGaleri(req, res) {
    try {
      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const validation = GaleriController.validateInput(req.body, { isCreate: true });
      if (!req.file) {
        validation.errors.push('foto wajib diupload');
      }

      if (!validation.isValid || validation.errors.length > 0) {
        if (req.file) safeUnlinkRelativeUpload(toRelativeUploadPath(buildFotoPath(req.file.filename)));
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const payload = {
        ...validation.data,
        foto_url: buildFotoPath(req.file.filename),
        created_by: idUser
      };

      const idGaleri = await GaleriModel.create(payload);
      const galeri = await GaleriModel.getById(idGaleri);

      return R.created(res, 'Galeri berhasil ditambahkan', galeri);
    } catch (error) {
      if (req.file) safeUnlinkRelativeUpload(toRelativeUploadPath(buildFotoPath(req.file.filename)));
      console.error('createGaleri error:', error);
      return R.serverError(res, 'Gagal menambahkan galeri');
    }
  }

  static async updateGaleri(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return R.badRequest(res, 'ID galeri tidak valid');
      }

      const currentGaleri = await GaleriModel.getById(id);
      if (!currentGaleri) {
        if (req.file) safeUnlinkRelativeUpload(toRelativeUploadPath(buildFotoPath(req.file.filename)));
        return R.notFound(res, 'Galeri tidak ditemukan');
      }

      const validation = GaleriController.validateInput(req.body, { isCreate: false });
      if (!validation.isValid) {
        if (req.file) safeUnlinkRelativeUpload(toRelativeUploadPath(buildFotoPath(req.file.filename)));
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const payload = { ...validation.data };
      if (req.file) {
        payload.foto_url = buildFotoPath(req.file.filename);
      }

      if (Object.keys(payload).length === 0) {
        return R.badRequest(res, 'Tidak ada data yang diupdate');
      }

      const result = await GaleriModel.update(id, payload);
      if (result.affectedRows === 0) {
        if (req.file) safeUnlinkRelativeUpload(toRelativeUploadPath(buildFotoPath(req.file.filename)));
        return R.notFound(res, 'Galeri tidak ditemukan');
      }

      if (req.file && currentGaleri.foto_url) {
        safeUnlinkRelativeUpload(toRelativeUploadPath(currentGaleri.foto_url));
      }

      const updatedGaleri = await GaleriModel.getById(id);
      return R.ok(res, 'Galeri berhasil diperbarui', updatedGaleri);
    } catch (error) {
      if (req.file) safeUnlinkRelativeUpload(toRelativeUploadPath(buildFotoPath(req.file.filename)));
      console.error('updateGaleri error:', error);
      return R.serverError(res, 'Gagal memperbarui galeri');
    }
  }

  static async updateStatusGaleri(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return R.badRequest(res, 'ID galeri tidak valid');
      }

      if (req.body.status_aktif === undefined) {
        return R.badRequest(res, 'Validasi gagal', ['status_aktif wajib diisi']);
      }

      const statusAktif = normalizeStatusAktif(req.body.status_aktif);
      const result = await GaleriModel.updateStatus(id, statusAktif);
      if (result.affectedRows === 0) {
        return R.notFound(res, 'Galeri tidak ditemukan');
      }

      const updatedGaleri = await GaleriModel.getById(id);
      return R.ok(res, 'Status galeri berhasil diperbarui', updatedGaleri);
    } catch (error) {
      console.error('updateStatusGaleri error:', error);
      return R.serverError(res, 'Gagal memperbarui status galeri');
    }
  }

  static async deleteGaleri(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return R.badRequest(res, 'ID galeri tidak valid');
      }

      const currentGaleri = await GaleriModel.getById(id);
      if (!currentGaleri) {
        return R.notFound(res, 'Galeri tidak ditemukan');
      }

      const result = await GaleriModel.delete(id);
      if (result.affectedRows === 0) {
        return R.notFound(res, 'Galeri tidak ditemukan');
      }

      safeUnlinkRelativeUpload(toRelativeUploadPath(currentGaleri.foto_url));
      return R.ok(res, 'Galeri berhasil dihapus', null);
    } catch (error) {
      console.error('deleteGaleri error:', error);
      return R.serverError(res, 'Gagal menghapus galeri');
    }
  }
}

module.exports = GaleriController;
