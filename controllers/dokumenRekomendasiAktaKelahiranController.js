const R = require('../utils/response');
const DokumenModel = require('../models/dokumenRekomendasiAktaKelahiranModel');
const { toPosixRelative, safeUnlinkRelativeUpload } = require('../utils/uploadFiles');

const JENIS_DOKUMEN_AKTA_KELAHIRAN = new Set([
  'surat_rekomendasi_lurah',
  'sk_lahir_bidan_dokter',
  'ktp_ortu',
  'kk',
  'surat_nikah',
  'akta_lahir_ortu_tionghoa'
]);

function normalizeFiles(reqFiles) {
  if (!reqFiles) return [];
  if (Array.isArray(reqFiles)) return reqFiles;
  if (typeof reqFiles === 'object') return Object.values(reqFiles).flat();
  return [];
}

class DokumenRekomendasiAktaKelahiranController {
  static async uploadDokumen(req, res) {
    try {
      if ((process.env.NODE_ENV || '').toLowerCase() === 'development') {
        console.log('REQ FILES AKTA KELAHIRAN:', req.files);
      }

      const idPengajuan = parseInt(req.params.id, 10);
      if (Number.isNaN(idPengajuan)) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const files = normalizeFiles(req.files);
      const legacyFile = files.find((f) => String(f.fieldname || '').trim() === 'file') || req.file || null;

      if (files.length === 0 && !legacyFile) {
        return R.badRequest(res, 'File wajib diupload');
      }

      const uploadedDocs = [];

      for (const file of files.filter((f) => String(f.fieldname || '').trim() !== 'file')) {
        const jenisDokumen = String(file.fieldname || '').trim();
        if (!JENIS_DOKUMEN_AKTA_KELAHIRAN.has(jenisDokumen)) {
          console.log('FIELD FILE TIDAK DIKENAL (AKTA KELAHIRAN):', jenisDokumen);
          continue;
        }

        const relativePath = toPosixRelative(file.path);
        const existing = await DokumenModel.getByPengajuanAndJenis(idPengajuan, jenisDokumen);
        if (!existing.success) {
          return R.serverError(res, `Gagal cek dokumen sebelumnya: ${existing.error || ''}`.trim());
        }

        const dokumenData = {
          jenis_dokumen: jenisDokumen,
          file_path: relativePath,
          original_name: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size
        };

        const upsert = await DokumenModel.upsertDokumen(idPengajuan, dokumenData);
        if (!upsert.success) {
          const detail = upsert.error ? `: ${upsert.error}` : '';
          return R.serverError(res, `Gagal menyimpan dokumen ke database${detail}`);
        }

        if (existing.data && existing.data.file_path && existing.data.file_path !== relativePath) {
          safeUnlinkRelativeUpload(existing.data.file_path);
        }

        uploadedDocs.push(dokumenData);
      }

      // legacy: jenis_dokumen + file
      if (uploadedDocs.length === 0 && legacyFile) {
        const jenisDokumen = String(req.body.jenis_dokumen || '').trim();
        if (!jenisDokumen) {
          return R.badRequest(res, 'jenis_dokumen wajib diisi');
        }
        if (!JENIS_DOKUMEN_AKTA_KELAHIRAN.has(jenisDokumen)) {
          return R.badRequest(res, 'jenis_dokumen tidak valid');
        }

        const relativePath = toPosixRelative(legacyFile.path);
        const existing = await DokumenModel.getByPengajuanAndJenis(idPengajuan, jenisDokumen);
        if (!existing.success) {
          return R.serverError(res, `Gagal cek dokumen sebelumnya: ${existing.error || ''}`.trim());
        }

        const dokumenData = {
          jenis_dokumen: jenisDokumen,
          file_path: relativePath,
          original_name: legacyFile.originalname,
          mime_type: legacyFile.mimetype,
          file_size: legacyFile.size
        };

        const upsert = await DokumenModel.upsertDokumen(idPengajuan, dokumenData);
        if (!upsert.success) {
          const detail = upsert.error ? `: ${upsert.error}` : '';
          return R.serverError(res, `Gagal menyimpan dokumen ke database${detail}`);
        }

        if (existing.data && existing.data.file_path && existing.data.file_path !== relativePath) {
          safeUnlinkRelativeUpload(existing.data.file_path);
        }

        uploadedDocs.push(dokumenData);
      }

      return R.created(res, 'Dokumen berhasil diupload', {
        id_pengajuan: idPengajuan,
        dokumen: uploadedDocs
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

module.exports = { DokumenRekomendasiAktaKelahiranController, JENIS_DOKUMEN_AKTA_KELAHIRAN };
