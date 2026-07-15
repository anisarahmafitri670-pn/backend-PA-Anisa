const fs = require('fs');
const PengajuanStatusModel = require('../models/pengajuanStatusModel');
const R = require('../utils/response');
const {
  getLayananConfig,
  normalizeStatus,
  normalizePengajuanRow,
  safeUploadPath
} = require('../utils/pengajuanLayanan');

function getIdPengajuan(req) {
  const idPengajuan = parseInt(req.params.id, 10);
  return Number.isNaN(idPengajuan) ? null : idPengajuan;
}

function getLayanan(req) {
  return req.params.layanan || req.layanan || req.body.layanan || req.query.layanan || null;
}

function validateLayanan(res, layanan) {
  if (layanan && !getLayananConfig(layanan)) {
    return R.badRequest(res, 'Layanan tidak valid');
  }

  return null;
}

function logEndpointError(label, req, error) {
  const layanan = getLayanan(req);
  const config = getLayananConfig(layanan);
  console.error(label, {
    service_key: layanan,
    id_pengajuan: req.params.id,
    table: config?.table || null,
    file_diterima: Boolean(req.file),
    error: error.message
  });
}

function removeFileIfSafe(filePath) {
  const absolutePath = safeUploadPath(filePath);
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return;
  }

  fs.unlinkSync(absolutePath);
}

function handleModelProblem(res, result) {
  if (!result) {
    return R.notFound(res, 'Pengajuan tidak ditemukan');
  }

  if (result.code === 'NOT_FOUND') {
    return R.notFound(res, 'Pengajuan tidak ditemukan');
  }

  if (result.code === 'AMBIGUOUS') {
    return R.badRequest(res, 'Layanan wajib dikirim karena id_pengajuan ditemukan pada lebih dari satu layanan');
  }

  if (result.code === 'INVALID_STATUS') {
    return R.badRequest(res, 'Status pengajuan tidak valid');
  }

  return R.serverError(res);
}

class PengajuanStatusController {
  static async detail(req, res) {
    try {
      const idPengajuan = getIdPengajuan(req);
      if (!idPengajuan) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const layanan = getLayanan(req);
      const layananError = validateLayanan(res, layanan);
      if (layananError) {
        return layananError;
      }

      const result = await PengajuanStatusModel.findById(idPengajuan, layanan);
      if (!result || result.ambiguous) {
        return handleModelProblem(res, result);
      }

      const normalized = normalizePengajuanRow(req, result.layanan, result.row);
      const isMasyarakat = req.user?.role === 'masyarakat';
      if (isMasyarakat && normalized.id_user && Number(normalized.id_user) !== Number(req.user.id_user)) {
        return R.notFound(res, 'Pengajuan tidak ditemukan');
      }

      return R.ok(res, 'Berhasil mengambil detail pengajuan', normalized);
    } catch (error) {
      logEndpointError('[pengajuan-detail:error]', req, error);
      return R.serverError(res);
    }
  }

  static async updateStatus(req, res) {
    try {
      const idPengajuan = getIdPengajuan(req);
      if (!idPengajuan) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const statusPengajuan = req.body.status_pengajuan || req.body.status;
      const normalizedStatus = normalizeStatus(statusPengajuan);
      if (!normalizedStatus) {
        return R.badRequest(res, 'Status pengajuan tidak valid');
      }

      const layanan = getLayanan(req);
      const layananError = validateLayanan(res, layanan);
      if (layananError) {
        return layananError;
      }

      const catatanPetugas = (req.body.catatan_petugas || '').trim();
      const before = await PengajuanStatusModel.findById(idPengajuan, layanan);
      if (!before || before.ambiguous) {
        return handleModelProblem(res, before);
      }

      console.log('[update-status]', {
        id_pengajuan: idPengajuan,
        layanan: before.layanan,
        status_sebelum: before.row.status,
        status_payload: statusPengajuan
      });

      const result = await PengajuanStatusModel.updateStatus(
        idPengajuan,
        before.layanan,
        normalizedStatus,
        catatanPetugas
      );
      if (!result.success) {
        return handleModelProblem(res, result);
      }

      console.log('[update-status]', {
        id_pengajuan: idPengajuan,
        layanan: result.layanan,
        status_setelah: result.data?.status
      });

      return R.ok(res, 'Status pengajuan berhasil diperbarui', normalizePengajuanRow(req, result.layanan, result.data));
    } catch (error) {
      logEndpointError('[update-status:error]', req, error);
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

      const layanan = getLayanan(req);
      const layananError = validateLayanan(res, layanan);
      if (layananError) {
        removeFileIfSafe(`/uploads/surat-hasil/${req.file.filename}`);
        return layananError;
      }

      const before = await PengajuanStatusModel.findById(idPengajuan, layanan);
      if (!before || before.ambiguous) {
        removeFileIfSafe(`/uploads/surat-hasil/${req.file.filename}`);
        return handleModelProblem(res, before);
      }

      const filePath = `/uploads/surat-hasil/${req.file.filename}`;
      console.log('[upload-surat-hasil]', {
        id_pengajuan: idPengajuan,
        layanan: before.layanan,
        status_sebelum: before.row.status,
        file_surat_hasil: filePath
      });

      const result = await PengajuanStatusModel.uploadSuratHasil(
        idPengajuan,
        before.layanan,
        filePath,
        req.file.originalname
      );
      if (!result.success) {
        removeFileIfSafe(filePath);
        return handleModelProblem(res, result);
      }

      if (result.oldFilePath && result.oldFilePath !== filePath) {
        removeFileIfSafe(result.oldFilePath);
      }

      return R.ok(res, 'Surat hasil berhasil diunggah', normalizePengajuanRow(req, result.layanan, result.data));
    } catch (error) {
      logEndpointError('[upload-surat-hasil:error]', req, error);
      return res.status(500).json({
        success: false,
        message: 'Gagal upload surat hasil',
        error: error.message
      });
    }
  }

  static async deleteSuratHasil(req, res) {
    try {
      const idPengajuan = getIdPengajuan(req);
      if (!idPengajuan) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const layanan = getLayanan(req);
      const layananError = validateLayanan(res, layanan);
      if (layananError) {
        return layananError;
      }

      const result = await PengajuanStatusModel.deleteSuratHasil(idPengajuan, layanan);
      if (!result.success) {
        return handleModelProblem(res, result);
      }

      if (result.oldFilePath) {
        removeFileIfSafe(result.oldFilePath);
      }

      return R.ok(res, 'Surat hasil berhasil dihapus', normalizePengajuanRow(req, result.layanan, result.data));
    } catch (error) {
      logEndpointError('[delete-surat-hasil:error]', req, error);
      return R.serverError(res);
    }
  }
}

module.exports = PengajuanStatusController;
