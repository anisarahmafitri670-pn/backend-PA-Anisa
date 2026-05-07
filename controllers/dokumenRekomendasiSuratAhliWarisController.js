const fs = require('fs');
const path = require('path');
const R = require('../utils/response');
const DokumenModel = require('../models/dokumenRekomendasiSuratAhliWarisModel');

const JENIS_DOKUMEN_SURAT_AHLI_WARIS = new Set([
  'ktp',
  'kk_ahli_waris',
  'surat_keterangan_kematian_kelurahan',
  'surat_tanah_pendukung'
]);

function safeUnlink(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (_) {
    // ignore
  }
}

class DokumenRekomendasiSuratAhliWarisController {
  static async uploadDokumen(req, res) {
    try {
      const idPengajuan = parseInt(req.params.id, 10);
      if (Number.isNaN(idPengajuan)) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const jenisDokumen = String(req.body.jenis_dokumen || '').trim();
      if (!jenisDokumen) {
        return R.badRequest(res, 'jenis_dokumen wajib diisi');
      }
      if (!JENIS_DOKUMEN_SURAT_AHLI_WARIS.has(jenisDokumen)) {
        return R.badRequest(res, 'jenis_dokumen tidak valid');
      }

      if (!req.file) {
        return R.badRequest(res, 'File wajib diupload');
      }

      const relativePath = path
        .relative(process.cwd(), req.file.path)
        .split(path.sep)
        .join('/');

      const existing = await DokumenModel.getByPengajuanAndJenis(idPengajuan, jenisDokumen);
      if (!existing.success) {
        return R.serverError(res, 'Gagal cek dokumen sebelumnya');
      }

      const dokumenData = {
        jenis_dokumen: jenisDokumen,
        file_path: relativePath,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        file_size: req.file.size
      };

      const upsert = await DokumenModel.upsertDokumen(idPengajuan, dokumenData);
      if (!upsert.success) {
        return R.serverError(res, 'Gagal menyimpan dokumen ke database');
      }

      if (existing.data && existing.data.file_path && existing.data.file_path !== relativePath) {
        const oldAbs = path.join(process.cwd(), existing.data.file_path);
        safeUnlink(oldAbs);
      }

      return R.created(res, 'Dokumen berhasil diupload', {
        id_pengajuan: idPengajuan,
        ...dokumenData
      });
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async listDokumen(req, res) {
    try {
      const idPengajuan = parseInt(req.params.id, 10);
      if (Number.isNaN(idPengajuan)) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const result = await DokumenModel.listByPengajuan(idPengajuan);
      if (result.success) {
        return R.ok(res, 'Berhasil mengambil data dokumen', result.data);
      }

      return R.serverError(res, 'Gagal mengambil data dokumen');
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = { DokumenRekomendasiSuratAhliWarisController, JENIS_DOKUMEN_SURAT_AHLI_WARIS };

