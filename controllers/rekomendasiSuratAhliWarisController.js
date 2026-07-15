const RekomendasiSuratAhliWarisModel = require('../models/rekomendasiSuratAhliWarisModel');
const { addNomorPengajuanToList } = require('../utils/nomorPengajuan');
const { validateNameField } = require('../utils/nameValidation');
const R = require('../utils/response');
const { normalizePengajuanRow } = require('../utils/pengajuanLayanan');

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function getTokenUserId(req) {
  return req.user && req.user.id_user ? Number(req.user.id_user) : null;
}

function isPetugas(req) {
  const role = String(req.user?.role || '').toLowerCase();
  return role === 'petugas' || role === 'kepala camat';
}

class RekomendasiSuratAhliWarisController {
  // Validasi field wajib
  static validateInput(data) {
    const errors = [];

    validateNameField(errors, 'nama_pewaris', data.nama_pewaris);

    const nikPewaris = normalizeDigits(data.nik_pewaris);
    if (!nikPewaris) {
      errors.push('nik_pewaris tidak boleh kosong');
    } else if (nikPewaris.length !== 16) {
      errors.push('nik_pewaris harus valid (16 digit angka)');
    }

    if (!data.alamat_pewaris || data.alamat_pewaris.trim() === '') {
      errors.push('alamat_pewaris tidak boleh kosong');
    }

    validateNameField(errors, 'nama_pemohon', data.nama_pemohon);

    const nikPemohon = normalizeDigits(data.nik_pemohon);
    if (!nikPemohon) {
      errors.push('nik_pemohon tidak boleh kosong');
    } else if (nikPemohon.length !== 16) {
      errors.push('nik_pemohon harus valid (16 digit angka)');
    }

    if (!data.alamat_pemohon || data.alamat_pemohon.trim() === '') {
      errors.push('alamat_pemohon tidak boleh kosong');
    }

    const noHp = normalizeDigits(data.no_hp);
    if (!noHp) {
      errors.push('no_hp tidak boleh kosong');
    } else if (noHp.length < 10 || noHp.length > 15) {
      errors.push('no_hp harus valid');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Buat pengajuan rekomendasi surat ahli waris baru
  static async buatPengajuan(req, res) {
    try {
      const {
        nama_pewaris,
        nik_pewaris,
        alamat_pewaris,
        nama_pemohon,
        nik_pemohon,
        alamat_pemohon,
        no_hp
      } = req.body;
      const idUser = getTokenUserId(req);

      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const validation = RekomendasiSuratAhliWarisController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const pengajuanData = {
        id_user: idUser,
        nama_pewaris: nama_pewaris.trim(),
        nik_pewaris: normalizeDigits(nik_pewaris),
        alamat_pewaris: alamat_pewaris.trim(),
        nama_pemohon: nama_pemohon.trim(),
        nik_pemohon: normalizeDigits(nik_pemohon),
        alamat_pemohon: alamat_pemohon.trim(),
        no_hp: normalizeDigits(no_hp)
      };

      const result = await RekomendasiSuratAhliWarisModel.savePengajuan(pengajuanData);

      if (result.success) {
        return R.created(res, 'Pengajuan rekomendasi surat ahli waris berhasil dibuat', {
          id_pengajuan: result.id,
          id_user: idUser,
          status: 'Menunggu verifikasi',
          ...pengajuanData
        });
      }

      return R.serverError(res, 'Gagal menyimpan pengajuan rekomendasi surat ahli waris ke database');
    } catch (error) {
      return R.serverError(res);
    }
  }

  // Ambil semua pengajuan
  static async getAllPengajuan(req, res) {
    try {
      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const result = await RekomendasiSuratAhliWarisModel.getAllPengajuan(isPetugas(req) ? null : idUser, req.query);
      if (result.success) {
        return R.okPaginated(
          res,
          'Berhasil mengambil data pengajuan rekomendasi surat ahli waris',
          addNomorPengajuanToList(result.data.map((row) => normalizePengajuanRow(req, 'rekomendasi_surat_ahli_waris', row)), 'AW'),
          result.pagination
        );
      }

      return R.serverError(res, 'Gagal mengambil data pengajuan rekomendasi surat ahli waris');
    } catch (error) {
      return R.serverError(res);
    }
  }

  // Ambil pengajuan berdasarkan ID
  static async getPengajuanById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const result = await RekomendasiSuratAhliWarisModel.getPengajuanById(id, isPetugas(req) ? null : idUser);
      if (result.success && result.data) {
        return R.ok(res, 'Berhasil mengambil data pengajuan rekomendasi surat ahli waris', normalizePengajuanRow(req, 'rekomendasi_surat_ahli_waris', result.data));
      }

      if (result.success && !result.data) {
        return R.notFound(res, 'Pengajuan rekomendasi surat ahli waris tidak ditemukan');
      }

      return R.serverError(res, 'Gagal mengambil data pengajuan rekomendasi surat ahli waris');
    } catch (error) {
      return R.serverError(res);
    }
  }

  // Update pengajuan
  static async updatePengajuan(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const validation = RekomendasiSuratAhliWarisController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const {
        nama_pewaris,
        nik_pewaris,
        alamat_pewaris,
        nama_pemohon,
        nik_pemohon,
        alamat_pemohon,
        no_hp
      } = req.body;
      const idUser = getTokenUserId(req);

      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const pengajuanData = {
        nama_pewaris: nama_pewaris.trim(),
        nik_pewaris: normalizeDigits(nik_pewaris),
        alamat_pewaris: alamat_pewaris.trim(),
        nama_pemohon: nama_pemohon.trim(),
        nik_pemohon: normalizeDigits(nik_pemohon),
        alamat_pemohon: alamat_pemohon.trim(),
        no_hp: normalizeDigits(no_hp)
      };

      const result = await RekomendasiSuratAhliWarisModel.updatePengajuan(id, pengajuanData, isPetugas(req) ? null : idUser);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan rekomendasi surat ahli waris berhasil diperbarui', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan rekomendasi surat ahli waris tidak ditemukan');
      }

      return R.serverError(res, 'Gagal memperbarui pengajuan rekomendasi surat ahli waris');
    } catch (error) {
      return R.serverError(res);
    }
  }

  // Hapus pengajuan
  static async hapusPengajuan(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const result = await RekomendasiSuratAhliWarisModel.deletePengajuan(id, isPetugas(req) ? null : idUser);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan rekomendasi surat ahli waris berhasil dihapus', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan rekomendasi surat ahli waris tidak ditemukan');
      }

      return R.serverError(res, 'Gagal menghapus pengajuan rekomendasi surat ahli waris');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = RekomendasiSuratAhliWarisController;
