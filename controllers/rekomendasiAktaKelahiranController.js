const RekomendasiAktaKelahiranModel = require('../models/rekomendasiAktaKelahiranModel');
const R = require('../utils/response');

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

class RekomendasiAktaKelahiranController {
  // Validasi field wajib
  static validateInput(data) {
    const errors = [];

    if (!data.nama_pemohon || data.nama_pemohon.trim() === '') {
      errors.push('nama_pemohon tidak boleh kosong');
    }

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

  // Buat pengajuan rekomendasi akta kelahiran baru
  static async buatPengajuan(req, res) {
    try {
      const { nama_pemohon, alamat, nik, no_hp } = req.body;

      // Validasi input
      const validation = RekomendasiAktaKelahiranController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const pengajuanData = {
        nama_pemohon: nama_pemohon.trim(),
        alamat: alamat.trim(),
        nik: normalizeDigits(nik),
        no_hp: normalizeDigits(no_hp)
      };

      const result = await RekomendasiAktaKelahiranModel.savePengajuan(pengajuanData);

      if (result.success) {
        return R.created(res, 'Pengajuan rekomendasi akta kelahiran berhasil dibuat', {
          id_pengajuan: result.id,
          status: 'Menunggu verifikasi',
          ...pengajuanData
        });
      }

      return R.serverError(res, 'Gagal menyimpan pengajuan rekomendasi akta kelahiran ke database');
    } catch (error) {
      return R.serverError(res);
    }
  }

  // Ambil semua pengajuan
  static async getAllPengajuan(req, res) {
    try {
      const result = await RekomendasiAktaKelahiranModel.getAllPengajuan();
      if (result.success) {
        return R.ok(res, 'Berhasil mengambil data pengajuan rekomendasi akta kelahiran', result.data);
      }

      return R.serverError(res, 'Gagal mengambil data pengajuan rekomendasi akta kelahiran');
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

      const result = await RekomendasiAktaKelahiranModel.getPengajuanById(id);
      if (result.success && result.data) {
        return R.ok(res, 'Berhasil mengambil data pengajuan rekomendasi akta kelahiran', result.data);
      }

      if (result.success && !result.data) {
        return R.notFound(res, 'Pengajuan rekomendasi akta kelahiran tidak ditemukan');
      }

      return R.serverError(res, 'Gagal mengambil data pengajuan rekomendasi akta kelahiran');
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

      const validation = RekomendasiAktaKelahiranController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const { nama_pemohon, alamat, nik, no_hp } = req.body;

      const pengajuanData = {
        nama_pemohon: nama_pemohon.trim(),
        alamat: alamat.trim(),
        nik: normalizeDigits(nik),
        no_hp: normalizeDigits(no_hp)
      };

      const result = await RekomendasiAktaKelahiranModel.updatePengajuan(id, pengajuanData);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan rekomendasi akta kelahiran berhasil diperbarui', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan rekomendasi akta kelahiran tidak ditemukan');
      }

      return R.serverError(res, 'Gagal memperbarui pengajuan rekomendasi akta kelahiran');
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

      const result = await RekomendasiAktaKelahiranModel.deletePengajuan(id);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan rekomendasi akta kelahiran berhasil dihapus', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan rekomendasi akta kelahiran tidak ditemukan');
      }

      return R.serverError(res, 'Gagal menghapus pengajuan rekomendasi akta kelahiran');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = RekomendasiAktaKelahiranController;
