const RekomendasiPenelitianModel = require('../models/rekomendasiPenelitianModel');
const R = require('../utils/response');

class RekomendasiPenelitianController {
  // Validasi field wajib
  static validateInput(data) {
    const errors = [];

    if (!data.nama_peneliti || data.nama_peneliti.trim() === '') {
      errors.push('nama_peneliti tidak boleh kosong');
    }

    if (!data.instansi || data.instansi.trim() === '') {
      errors.push('instansi tidak boleh kosong');
    }

    if (!data.topik_penelitian || data.topik_penelitian.trim() === '') {
      errors.push('topik_penelitian tidak boleh kosong');
    }

    if (!data.lokasi_penelitian || data.lokasi_penelitian.trim() === '') {
      errors.push('lokasi_penelitian tidak boleh kosong');
    }

    if (!data.waktu_penelitian || data.waktu_penelitian.trim() === '') {
      errors.push('waktu_penelitian tidak boleh kosong');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Buat rekomendasi penelitian baru
  static async buatRekomendasi(req, res) {
    try {
      const {
        nama_peneliti,
        instansi,
        topik_penelitian,
        lokasi_penelitian,
        waktu_penelitian
      } = req.body;

      // Validasi input
      const validation = RekomendasiPenelitianController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

      const rekomendasiData = {
        nama_peneliti: nama_peneliti.trim(),
        instansi: instansi.trim(),
        topik_penelitian: topik_penelitian.trim(),
        lokasi_penelitian: lokasi_penelitian.trim(),
        waktu_penelitian: waktu_penelitian.trim(),
      };

      const result = await RekomendasiPenelitianModel.saveRekomendasi(rekomendasiData);

      if (result.success) {
        return R.created(res, 'Rekomendasi penelitian berhasil dibuat', {
          id_pengajuan: result.id,
          ...rekomendasiData
        });
      }

      return R.serverError(res, 'Gagal menyimpan rekomendasi penelitian ke database');
    } catch (error) {
      return R.serverError(res);
    }
  }

  //Ambil Semua data
  static async getAllRekomendasi(req, res) {
    try {
      const result = await RekomendasiPenelitianModel.getAllRekomendasi();
      if (result.success) {
        return R.ok(res, 'Berhasil mengambil data rekomendasi penelitian', result.data);
      }

      return R.serverError(res, 'Gagal mengambil data rekomendasi penelitian');
    } catch (error) {
      return R.serverError(res);
    }
  }

  //Ambil data berdasarkan ID
  static async getRekomendasiById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID rekomendasi tidak valid');
      }

      const result = await RekomendasiPenelitianModel.getRekomendasiById(id);
      if (result.success && result.data) {
        return R.ok(res, 'Berhasil mengambil data rekomendasi penelitian', result.data);
      }

      if (result.success && !result.data) {
        return R.notFound(res, 'Rekomendasi penelitian tidak ditemukan');
      }

      return R.serverError(res, 'Gagal mengambil data rekomendasi penelitian');
    } catch (error) {
      return R.serverError(res);
    }
  }

  //Update Data
  static async updateRekomendasi(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID rekomendasi tidak valid');
      }

      const validation = RekomendasiPenelitianController.validateInput(req.body);
      if (!validation.isValid) {
        return R.badRequest(res, 'Validasi gagal', validation.errors);
      }

       const {
        nama_peneliti,
        instansi,
        topik_penelitian,
        lokasi_penelitian,
        waktu_penelitian
      } = req.body;

      const rekomendasiData = {
        nama_peneliti: nama_peneliti.trim(),
        instansi: instansi.trim(),
        topik_penelitian: topik_penelitian.trim(),
        lokasi_penelitian: lokasi_penelitian.trim(),
        waktu_penelitian: waktu_penelitian.trim()
      };

      const result = await RekomendasiPenelitianModel.updateRekomendasi(id, rekomendasiData);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Rekomendasi penelitian berhasil diperbarui', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Rekomendasi penelitian tidak ditemukan');
      }

      return R.serverError(res, 'Gagal memperbarui rekomendasi penelitian');
    } catch (error) {
      return R.serverError(res);
    }
  }

  //Hapus Data
  static async hapusRekomendasi(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID rekomendasi tidak valid');
      }

       const result = await RekomendasiPenelitianModel.deleteRekomendasi(id);

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Rekomendasi penelitian berhasil dihapus', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Rekomendasi penelitian tidak ditemukan');
      }

      return R.serverError(res, 'Gagal menghapus rekomendasi penelitian');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = RekomendasiPenelitianController;
