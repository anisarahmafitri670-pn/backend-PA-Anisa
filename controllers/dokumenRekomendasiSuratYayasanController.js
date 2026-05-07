const fs = require('fs');
const path = require('path');
const R = require('../utils/response');
const DokumenModel = require('../models/dokumenRekomendasiSuratYayasanModel');

const JENIS_DOKUMEN_SURAT_YAYASAN = new Set([
  'rekomendasi_lurah_penghulu_asli',
  'daftar_nama_guru_pengurus',
  'daftar_nama_anak_didik',
  'foto_dokumentasi_gedung_dan_musyawarah',
  'ktp_pengurus',
  'akta_notaris_pendirian'
]);

function safeUnlink(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (_) {
    // ignore
  }
}

class DokumenRekomendasiSuratYayasanController {
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
      if (!JENIS_DOKUMEN_SURAT_YAYASAN.has(jenisDokumen)) {
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

module.exports = { DokumenRekomendasiSuratYayasanController, JENIS_DOKUMEN_SURAT_YAYASAN };

