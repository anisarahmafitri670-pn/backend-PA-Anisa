const R = require('../utils/response');
const DokumenModel = require('../models/dokumenRekomendasiPenelitianModel');
const { toPosixRelative, safeUnlinkRelativeUpload } = require('../utils/uploadFiles');

const JENIS_DOKUMEN_PENELITIAN = new Set([
  'ktp_mahasiswa',
  'ktm_mahasiswa',
  'surat_rekomendasi_riset_univ_kesbangpol'
]);

function getMulterFileFromFields(reqFiles, fieldName) {
  if (!reqFiles || typeof reqFiles !== 'object') return null;
  const entry = reqFiles[fieldName];
  if (!entry || !Array.isArray(entry) || entry.length === 0) return null;
  return entry[0];
}

function normalizeReqFiles(reqFiles) {
  if (!reqFiles) return { type: 'none', filesArray: [], filesMap: {} };
  if (Array.isArray(reqFiles)) {
    return { type: 'array', filesArray: reqFiles, filesMap: {} };
  }
  if (typeof reqFiles === 'object') {
    return { type: 'map', filesArray: [], filesMap: reqFiles };
  }
  return { type: 'unknown', filesArray: [], filesMap: {} };
}

class DokumenRekomendasiPenelitianController {
  static async uploadDokumen(req, res) {
    try {
      console.log('REQ FILES PENELITIAN:', req.file);
      console.log('REQ FILES PENELITIAN ALL:', req.files);
      console.log('REQ BODY PENELITIAN:', req.body);

      const idPengajuan = parseInt(req.params.id, 10);
      if (Number.isNaN(idPengajuan)) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const uploadedDocs = [];

      // New mode: 3 files at once (field name becomes jenis_dokumen)
      const normalized = normalizeReqFiles(req.files);
      const filesMap = normalized.filesMap;
      const multiFieldNames = ['ktp_mahasiswa', 'ktm_mahasiswa', 'surat_rekomendasi_riset_univ_kesbangpol'];
      const multiUploads =
        normalized.type === 'array'
          ? normalized.filesArray
              .map((file) => ({ fieldName: String(file.fieldname || '').trim(), file }))
              .filter(({ fieldName }) => {
                if (!multiFieldNames.includes(fieldName)) {
                  if (fieldName) console.log('FIELD FILE TIDAK DIKENAL:', fieldName);
                  return false;
                }
                return true;
              })
          : multiFieldNames
              .map((fieldName) => ({ fieldName, file: getMulterFileFromFields(filesMap, fieldName) }))
              .filter((x) => !!x.file);

      // Legacy mode: jenis_dokumen + file
      const legacyFile =
        normalized.type === 'array'
          ? normalized.filesArray.find((file) => file.fieldname === 'file') || req.file || null
          : getMulterFileFromFields(filesMap, 'file') || req.file || null;

      if (multiUploads.length === 0 && !legacyFile) {
        return R.badRequest(res, 'File wajib diupload');
      }

      if (multiUploads.length > 0) {
        for (const { fieldName, file } of multiUploads) {
          const jenisDokumen = fieldName;
          if (!JENIS_DOKUMEN_PENELITIAN.has(jenisDokumen)) {
            return R.badRequest(res, 'jenis_dokumen tidak valid');
          }

          const relativePath = toPosixRelative(file.path);

          const dokumenData = {
            jenis_dokumen: jenisDokumen,
            file_path: relativePath,
            original_name: file.originalname,
            mime_type: file.mimetype,
            file_size: file.size
          };

          const existing = await DokumenModel.getByPengajuanAndJenis(idPengajuan, jenisDokumen);
          if (!existing.success) {
            return R.serverError(res, `Gagal cek dokumen sebelumnya: ${existing.error || ''}`.trim());
          }

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
      } else if (legacyFile) {
        const jenisDokumen = String(req.body.jenis_dokumen || '').trim();
        if (!jenisDokumen) {
          return R.badRequest(res, 'jenis_dokumen wajib diisi');
        }
        if (!JENIS_DOKUMEN_PENELITIAN.has(jenisDokumen)) {
          return R.badRequest(res, 'jenis_dokumen tidak valid');
        }

        const relativePath = toPosixRelative(legacyFile.path);

        const dokumenData = {
          jenis_dokumen: jenisDokumen,
          file_path: relativePath,
          original_name: legacyFile.originalname,
          mime_type: legacyFile.mimetype,
          file_size: legacyFile.size
        };

        const existing = await DokumenModel.getByPengajuanAndJenis(idPengajuan, jenisDokumen);
        if (!existing.success) {
          return R.serverError(res, `Gagal cek dokumen sebelumnya: ${existing.error || ''}`.trim());
        }

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

      if (uploadedDocs.length === 0 && normalized.type !== 'none' && !legacyFile) {
        return R.badRequest(res, 'Tidak ada file dokumen yang valid');
      }

      return R.created(res, 'Dokumen berhasil diupload', {
        id_pengajuan: idPengajuan,
        dokumen: uploadedDocs
      });
    } catch (error) {
      console.error('UPLOAD DOKUMEN PENELITIAN ERROR:', error);
      return R.serverError(res, error.message || 'Terjadi kesalahan pada server');
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

  static async hapusDokumen(req, res) {
    try {
      const idPengajuan = parseInt(req.params.id, 10);
      if (Number.isNaN(idPengajuan)) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const jenisDokumen = String(req.params.jenis_dokumen || '').trim();
      if (!jenisDokumen || !JENIS_DOKUMEN_PENELITIAN.has(jenisDokumen)) {
        return R.badRequest(res, 'jenis_dokumen tidak valid');
      }

      const existing = await DokumenModel.getByPengajuanAndJenis(idPengajuan, jenisDokumen);
      if (!existing.success) {
        return R.serverError(res, `Gagal cek dokumen: ${existing.error || ''}`.trim());
      }

      if (!existing.data) {
        return R.notFound(res, 'Dokumen tidak ditemukan');
      }

      const deleted = await DokumenModel.deleteByPengajuanAndJenis(idPengajuan, jenisDokumen);
      if (!deleted.success) {
        return R.serverError(res, `Gagal menghapus dokumen dari database: ${deleted.error || ''}`.trim());
      }

      if (deleted.affectedRows === 0) {
        return R.notFound(res, 'Dokumen tidak ditemukan');
      }

      if (existing.data.file_path) {
        safeUnlinkRelativeUpload(existing.data.file_path);
      }

      return R.ok(res, 'Dokumen berhasil dihapus', {
        id_pengajuan: idPengajuan,
        jenis_dokumen: jenisDokumen
      });
    } catch (error) {
      return R.serverError(res, error.message || 'Terjadi kesalahan pada server');
    }
  }
}

module.exports = { DokumenRekomendasiPenelitianController, JENIS_DOKUMEN_PENELITIAN };
