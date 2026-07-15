const RekomendasiKartuKeluargaModel = require('../models/rekomendasiKartuKeluargaModel');
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

class RekomendasiKartuKeluargaController {
  // Validasi field wajib
  static validateInput(data) {
    const errors = [];

    validateNameField(errors, 'nama_pemohon', data.nama_pemohon);

    if (!data.alamat || data.alamat.trim() === '') {
      errors.push('alamat tidak boleh kosong');
    }

    const nik = normalizeDigits(data.nik);
    if (!nik) {
      errors.push('NIK tidak boleh kosong');
    } else if (nik.length !== 16) {
      errors.push('NIK harus valid (16 digit angka)');
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

  // Buat pengajuan rekomendasi kartu keluarga baru
  static async buatPengajuan(req, res) {
    try {
      const { nama_pemohon, alamat, nik, no_hp } = req.body;
      const idUser = getTokenUserId(req);

      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      // Validasi input
      const validation = RekomendasiKartuKeluargaController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const pengajuanData = {
        id_user: idUser,
        nama_pemohon: nama_pemohon.trim(),
        alamat: alamat.trim(),
        nik: normalizeDigits(nik),
        no_hp: normalizeDigits(no_hp)
      };

      const result = await RekomendasiKartuKeluargaModel.savePengajuan(pengajuanData);

      if (result.success) {
        return R.created(res, 'Pengajuan rekomendasi kartu keluarga berhasil dibuat', {
          id_pengajuan: result.id,
          id_user: idUser,
          status: 'Menunggu verifikasi',
          ...pengajuanData
        });
      }

      return R.serverError(res, 'Gagal menyimpan pengajuan rekomendasi kartu keluarga ke database');
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

      const result = await RekomendasiKartuKeluargaModel.getAllPengajuan(isPetugas(req) ? null : idUser, req.query);
      if (result.success) {
        return R.okPaginated(
          res,
          'Berhasil mengambil data pengajuan rekomendasi kartu keluarga',
          addNomorPengajuanToList(result.data.map((row) => normalizePengajuanRow(req, 'rekomendasi_kartu_keluarga', row)), 'KK'),
          result.pagination
        );
      }

      return R.serverError(res, 'Gagal mengambil data pengajuan rekomendasi kartu keluarga');
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

      const result = await RekomendasiKartuKeluargaModel.getPengajuanById(id, isPetugas(req) ? null : idUser);
      if (result.success && result.data) {
        return R.ok(res, 'Berhasil mengambil data pengajuan rekomendasi kartu keluarga', normalizePengajuanRow(req, 'rekomendasi_kartu_keluarga', result.data));
      }

      if (result.success && !result.data) {
        return R.notFound(res, 'Pengajuan rekomendasi kartu keluarga tidak ditemukan');
      }

      return R.serverError(res, 'Gagal mengambil data pengajuan rekomendasi kartu keluarga');
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

      const validation = RekomendasiKartuKeluargaController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const { nama_pemohon, alamat, nik, no_hp } = req.body;
      const idUser = getTokenUserId(req);

      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const pengajuanData = {
        nama_pemohon: nama_pemohon.trim(),
        alamat: alamat.trim(),
        nik: normalizeDigits(nik),
        no_hp: normalizeDigits(no_hp)
      };

      const result = await RekomendasiKartuKeluargaModel.updatePengajuan(id, pengajuanData, isPetugas(req) ? null : idUser);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan rekomendasi kartu keluarga berhasil diperbarui', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan rekomendasi kartu keluarga tidak ditemukan');
      }

      return R.serverError(res, 'Gagal memperbarui pengajuan rekomendasi kartu keluarga');
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

      const result = await RekomendasiKartuKeluargaModel.deletePengajuan(id, isPetugas(req) ? null : idUser);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan rekomendasi kartu keluarga berhasil dihapus', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan rekomendasi kartu keluarga tidak ditemukan');
      }

      return R.serverError(res, 'Gagal menghapus pengajuan rekomendasi kartu keluarga');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = RekomendasiKartuKeluargaController;
