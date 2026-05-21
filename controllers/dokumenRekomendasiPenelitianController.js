const R = require('../utils/response');
const DokumenModel = require('../models/dokumenRekomendasiPenelitianModel');
const { uploadToCloudinary } = require('../middleware/uploadPenelitian');

const JENIS_DOKUMEN_PENELITIAN = new Set([
  'ktp_mahasiswa',
  'ktm_mahasiswa',
  'surat_rekomendasi_riset_univ_kesbangpol'
]);

function detectResourceType(mimeType) {
  return mimeType === 'application/pdf' ? 'raw' : 'image';
}

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
      const idPengajuan = parseInt(req.params.id, 10);
      if (Number.isNaN(idPengajuan)) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const uploadedDocs = [];
      const cloudinaryFolder = `uploads/penelitian/${idPengajuan}`;

      // New mode: 3 files at once (field name becomes jenis_dokumen)
      const normalized = normalizeReqFiles(req.files);
      const filesMap = normalized.filesMap;
      const multiFieldNames = ['ktp_mahasiswa', 'ktm_mahasiswa', 'surat_rekomendasi_riset_univ_kesbangpol'];
      const multiUploads =
        normalized.type === 'array'
          ? normalized.filesArray
              .filter((file) => multiFieldNames.includes(file.fieldname))
              .map((file) => ({ fieldName: file.fieldname, file }))
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

          const resourceType = detectResourceType(file.mimetype);
          const publicId = `${jenisDokumen}_${Date.now()}`;

          let cloudinaryResult;
          try {
            cloudinaryResult = await uploadToCloudinary(file.buffer, cloudinaryFolder, resourceType, publicId);
          } catch (error) {
            const detail = error && error.message ? `: ${error.message}` : '';
            return R.serverError(res, `Gagal upload ke Cloudinary${detail}`);
          }

          const dokumenData = {
            jenis_dokumen: jenisDokumen,
            file_path: cloudinaryResult.secure_url,
            original_name: file.originalname,
            mime_type: file.mimetype,
            file_size: file.size
          };

          const upsert = await DokumenModel.upsertDokumen(idPengajuan, dokumenData);
          if (!upsert.success) {
            const detail = upsert.error ? `: ${upsert.error}` : '';
            return R.serverError(res, `Gagal menyimpan dokumen ke database${detail}`);
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

        const resourceType = detectResourceType(legacyFile.mimetype);
        const publicId = `${jenisDokumen}_${Date.now()}`;

        let cloudinaryResult;
        try {
          cloudinaryResult = await uploadToCloudinary(legacyFile.buffer, cloudinaryFolder, resourceType, publicId);
        } catch (error) {
          const detail = error && error.message ? `: ${error.message}` : '';
          return R.serverError(res, `Gagal upload ke Cloudinary${detail}`);
        }

        const dokumenData = {
          jenis_dokumen: jenisDokumen,
          file_path: cloudinaryResult.secure_url,
          original_name: legacyFile.originalname,
          mime_type: legacyFile.mimetype,
          file_size: legacyFile.size
        };

        const upsert = await DokumenModel.upsertDokumen(idPengajuan, dokumenData);
        if (!upsert.success) {
          const detail = upsert.error ? `: ${upsert.error}` : '';
          return R.serverError(res, `Gagal menyimpan dokumen ke database${detail}`);
        }

        uploadedDocs.push(dokumenData);
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
}

module.exports = { DokumenRekomendasiPenelitianController, JENIS_DOKUMEN_PENELITIAN };
