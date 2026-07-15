const VerifikasiPetugasModel = require('../models/verifikasiPetugasModel');
const PengajuanStatusModel = require('../models/pengajuanStatusModel');
const R = require('../utils/response');
const { normalizePengajuanRow } = require('../utils/pengajuanLayanan');

function getIdPengajuan(req) {
  const idPengajuan = parseInt(req.params.id, 10);
  return Number.isNaN(idPengajuan) ? null : idPengajuan;
}

function getCatatanPetugas(req) {
  return (req.body.catatan_petugas || '').trim();
}

class VerifikasiPetugasController {
  static async verifikasi(req, res) {
    try {
      const idPengajuan = getIdPengajuan(req);
      if (!idPengajuan) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const result = await VerifikasiPetugasModel.verifikasi(req.layanan, idPengajuan);
      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan berhasil diverifikasi', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan tidak ditemukan');
      }

      return R.serverError(res, 'Gagal memverifikasi pengajuan');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async diproses(req, res) {
    try {
      const idPengajuan = getIdPengajuan(req);
      if (!idPengajuan) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const result = await PengajuanStatusModel.updateStatus(
        idPengajuan,
        req.layanan,
        'Diproses',
        getCatatanPetugas(req)
      );
      if (result.success && result.data) {
        return R.ok(res, 'Pengajuan sedang diproses', normalizePengajuanRow(req, result.layanan, result.data));
      }

      if (result.code === 'NOT_FOUND') {
        return R.notFound(res, 'Pengajuan tidak ditemukan');
      }

      if (result.code === 'AMBIGUOUS') {
        return R.badRequest(res, 'ID pengajuan ditemukan di lebih dari satu layanan, gunakan endpoint layanan yang spesifik');
      }

      return R.serverError(res, 'Gagal memproses pengajuan');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async ditolak(req, res) {
    try {
      const idPengajuan = getIdPengajuan(req);
      if (!idPengajuan) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const catatanPetugas = getCatatanPetugas(req);
      if (!catatanPetugas) {
        return R.badRequest(res, 'catatan_petugas wajib diisi');
      }

      const result = await PengajuanStatusModel.updateStatus(
        idPengajuan,
        req.layanan,
        'Ditolak',
        catatanPetugas
      );
      if (result.success && result.data) {
        return R.ok(res, 'Pengajuan ditolak', normalizePengajuanRow(req, result.layanan, result.data));
      }

      if (result.code === 'NOT_FOUND') {
        return R.notFound(res, 'Pengajuan tidak ditemukan');
      }

      if (result.code === 'AMBIGUOUS') {
        return R.badRequest(res, 'ID pengajuan ditemukan di lebih dari satu layanan, gunakan endpoint layanan yang spesifik');
      }

      return R.serverError(res, 'Gagal menolak pengajuan');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async uploadSuratHasil(req, res) {
    try {
      const idPengajuan = getIdPengajuan(req);
      if (!idPengajuan) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      if (!req.file) {
        return R.badRequest(res, 'surat_hasil wajib diupload');
      }

      const filePath = `/uploads/surat-hasil/${req.file.filename}`;
      const result = await PengajuanStatusModel.uploadSuratHasil(
        idPengajuan,
        req.layanan,
        filePath,
        req.file.originalname
      );

      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Surat hasil berhasil diunggah', normalizePengajuanRow(req, result.layanan, result.data));
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan tidak ditemukan');
      }

      return R.serverError(res, 'Gagal mengunggah surat hasil');
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async selesai(req, res) {
    try {
      const idPengajuan = getIdPengajuan(req);
      if (!idPengajuan) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const result = await VerifikasiPetugasModel.selesai(req.layanan, idPengajuan);
      if (result.success && result.affectedRows > 0) {
        return R.ok(res, 'Pengajuan selesai', null);
      }

      if (result.success && result.affectedRows === 0) {
        return R.notFound(res, 'Pengajuan tidak ditemukan');
      }

      return R.serverError(res, 'Gagal menyelesaikan pengajuan');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = VerifikasiPetugasController;
