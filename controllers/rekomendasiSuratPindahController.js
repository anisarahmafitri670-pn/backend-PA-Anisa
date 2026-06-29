const RekomendasiSuratPindahModel = require('../models/rekomendasiSuratPindahModel');
const { addNomorPengajuanToList } = require('../utils/nomorPengajuan');
const R = require('../utils/response');

function getTokenUserId(req) {
  return req.user && req.user.id_user ? Number(req.user.id_user) : null;
}

function isPetugas(req) {
  return req.user && req.user.role === 'petugas';
}

class RekomendasiSuratPindahController {
  // Validasi field wajib
  static validateInput(data) {
    const errors = [];

    if (!data.nama_lengkap || data.nama_lengkap.trim() === '') {
      errors.push('nama_lengkap tidak boleh kosong');
    }

    if (!data.alamat_asal || data.alamat_asal.trim() === '') {
      errors.push('alamat_asal tidak boleh kosong');
    }

    if (!data.alamat_pindah || data.alamat_pindah.trim() === '') {
      errors.push('alamat_pindah tidak boleh kosong');
    } else if (data.alamat_pindah.trim().length < 5) {
      errors.push('alamat_pindah harus valid');
    }

    if (
      data.alamat_asal &&
      data.alamat_pindah &&
      data.alamat_asal.trim().toLowerCase() === data.alamat_pindah.trim().toLowerCase()
    ) {
      errors.push('alamat_pindah harus berbeda dari alamat_asal');
    }

    if (!data.keterangan || data.keterangan.trim() === '') {
      errors.push('keterangan tidak boleh kosong');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Buat pengajuan rekomendasi surat pindah baru
  static async buatPengajuan(req, res) {
    try {
      const { nama_lengkap, alamat_asal, alamat_pindah, keterangan } = req.body;
      const idUser = getTokenUserId(req);

      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      // Validasi input
      const validation = RekomendasiSuratPindahController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const pengajuanData = {
        id_user: idUser,
        nama_lengkap: nama_lengkap.trim(),
        alamat_asal: alamat_asal.trim(),
        alamat_pindah: alamat_pindah.trim(),
        keterangan: keterangan.trim()
      };

      const result = await RekomendasiSuratPindahModel.savePengajuan(pengajuanData);

      if (result.success) {
        return R.created(res, 'Pengajuan rekomendasi surat pindah berhasil dibuat', {
          id_pengajuan: result.id,
          id_user: idUser,
          status: 'Menunggu verifikasi',
          ...pengajuanData
        });
      }

      return R.serverError(res, 'Gagal menyimpan pengajuan rekomendasi surat pindah ke database');
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

      const result = await RekomendasiSuratPindahModel.getAllPengajuan(isPetugas(req) ? null : idUser);
      if (result.success) {
        return R.ok(
          res,
          'Berhasil mengambil data pengajuan rekomendasi surat pindah',
          addNomorPengajuanToList(result.data, 'SP')
        );
      }

      return R.serverError(res, 'Gagal mengambil data pengajuan rekomendasi surat pindah');
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

      const result = await RekomendasiSuratPindahModel.getPengajuanById(id, isPetugas(req) ? null : idUser);
      if (result.success && result.data) {
        return R.ok(res, 'Berhasil mengambil data pengajuan rekomendasi surat pindah', result.data);
      }

      if (result.success && !result.data) {
        return R.notFound(res, 'Pengajuan rekomendasi surat pindah tidak ditemukan');
      }

      return R.serverError(res, 'Gagal mengambil data pengajuan rekomendasi surat pindah');
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

      const validation = RekomendasiSuratPindahController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const { nama_lengkap, alamat_asal, alamat_pindah, keterangan } = req.body;
      const idUser = getTokenUserId(req);

      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const pengajuanData = {
        nama_lengkap: nama_lengkap.trim(),
        alamat_asal: alamat_asal.trim(),
        alamat_pindah: alamat_pindah.trim(),
        keterangan: keterangan.trim()
      };

      const result = await RekomendasiSuratPindahModel.updatePengajuan(id, pengajuanData, isPetugas(req) ? null : idUser);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan rekomendasi surat pindah berhasil diperbarui', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan rekomendasi surat pindah tidak ditemukan');
      }

      return R.serverError(res, 'Gagal memperbarui pengajuan rekomendasi surat pindah');
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

      const result = await RekomendasiSuratPindahModel.deletePengajuan(id, isPetugas(req) ? null : idUser);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan rekomendasi surat pindah berhasil dihapus', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan rekomendasi surat pindah tidak ditemukan');
      }

      return R.serverError(res, 'Gagal menghapus pengajuan rekomendasi surat pindah');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = RekomendasiSuratPindahController;
