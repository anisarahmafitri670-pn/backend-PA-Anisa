const RekomendasiSuratYayasanModel = require('../models/rekomendasiSuratYayasanModel');
const { addNomorPengajuanToList } = require('../utils/nomorPengajuan');
const { validateNameField } = require('../utils/nameValidation');
const R = require('../utils/response');

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function getTokenUserId(req) {
  return req.user && req.user.id_user ? Number(req.user.id_user) : null;
}

function isPetugas(req) {
  return req.user && req.user.role === 'petugas';
}

class RekomendasiSuratYayasanController {
  // Validasi field wajib
  static validateInput(data) {
    const errors = [];

    validateNameField(errors, 'nama_pemohon', data.nama_pemohon);

    const nik = normalizeDigits(data.nik);
    if (!nik) {
      errors.push('NIK tidak boleh kosong');
    } else if (nik.length !== 16) {
      errors.push('NIK harus valid (16 digit angka)');
    }

    if (!data.jabatan || data.jabatan.trim() === '') {
      errors.push('jabatan tidak boleh kosong');
    }

    validateNameField(errors, 'nama_lembaga', data.nama_lembaga);

    if (!data.alamat_lembaga || data.alamat_lembaga.trim() === '') {
      errors.push('alamat_lembaga tidak boleh kosong');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Buat pengajuan rekomendasi surat yayasan baru
  static async buatPengajuan(req, res) {
    try {
      const { nama_pemohon, nik, jabatan, nama_lembaga, alamat_lembaga } = req.body;
      const idUser = getTokenUserId(req);

      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const validation = RekomendasiSuratYayasanController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const pengajuanData = {
        id_user: idUser,
        nama_pemohon: nama_pemohon.trim(),
        nik: normalizeDigits(nik),
        jabatan: jabatan.trim(),
        nama_lembaga: nama_lembaga.trim(),
        alamat_lembaga: alamat_lembaga.trim()
      };

      const result = await RekomendasiSuratYayasanModel.savePengajuan(pengajuanData);

      if (result.success) {
        return R.created(res, 'Pengajuan rekomendasi surat yayasan berhasil dibuat', {
          id_pengajuan: result.id,
          id_user: idUser,
          status: 'Menunggu verifikasi',
          ...pengajuanData
        });
      }

      return R.serverError(res, 'Gagal menyimpan pengajuan rekomendasi surat yayasan ke database');
    } catch (error) {
      return R.serverError(res);
    }
  }

  // Ambil semua pengajuan
  static async getAllPengajuan(req, res) {
    try {
      console.log('[YAYASAN] getAllPengajuan dipanggil');
      console.log('[YAYASAN] req.user:', req.user);

      const idUser = getTokenUserId(req);
      console.log('[YAYASAN] idUser:', idUser);

      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const petugasMode = isPetugas(req);
      console.log('[YAYASAN] petugasMode:', petugasMode);

      const result = await RekomendasiSuratYayasanModel.getAllPengajuan(petugasMode ? null : idUser);
      console.log('[YAYASAN] hasil model:', result);

      if (result.success) {
        return R.ok(
          res,
          'Berhasil mengambil data pengajuan rekomendasi surat yayasan',
          addNomorPengajuanToList(result.data, 'SY')
        );
      }

      console.error('GET YAYASAN LIST ERROR:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data pengajuan rekomendasi surat yayasan',
        error: result.error || 'Unknown database error'
      });
    } catch (error) {
      console.error('GET YAYASAN LIST EXCEPTION:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
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

      const result = await RekomendasiSuratYayasanModel.getPengajuanById(id, isPetugas(req) ? null : idUser);
      if (result.success && result.data) {
        return R.ok(res, 'Berhasil mengambil data pengajuan rekomendasi surat yayasan', result.data);
      }

      if (result.success && !result.data) {
        return R.notFound(res, 'Pengajuan rekomendasi surat yayasan tidak ditemukan');
      }

      return R.serverError(res, 'Gagal mengambil data pengajuan rekomendasi surat yayasan');
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

      const validation = RekomendasiSuratYayasanController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const { nama_pemohon, nik, jabatan, nama_lembaga, alamat_lembaga } = req.body;
      const idUser = getTokenUserId(req);

      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const pengajuanData = {
        nama_pemohon: nama_pemohon.trim(),
        nik: normalizeDigits(nik),
        jabatan: jabatan.trim(),
        nama_lembaga: nama_lembaga.trim(),
        alamat_lembaga: alamat_lembaga.trim()
      };

      const result = await RekomendasiSuratYayasanModel.updatePengajuan(id, pengajuanData, isPetugas(req) ? null : idUser);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan rekomendasi surat yayasan berhasil diperbarui', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan rekomendasi surat yayasan tidak ditemukan');
      }

      return R.serverError(res, 'Gagal memperbarui pengajuan rekomendasi surat yayasan');
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

      const result = await RekomendasiSuratYayasanModel.deletePengajuan(id, isPetugas(req) ? null : idUser);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan rekomendasi surat yayasan berhasil dihapus', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan rekomendasi surat yayasan tidak ditemukan');
      }

      return R.serverError(res, 'Gagal menghapus pengajuan rekomendasi surat yayasan');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = RekomendasiSuratYayasanController;
