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

class DokumenRekomendasiPenelitianController {
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
      if (!JENIS_DOKUMEN_PENELITIAN.has(jenisDokumen)) {
        return R.badRequest(res, 'jenis_dokumen tidak valid');
      }

      if (!req.file) {
        return R.badRequest(res, 'File wajib diupload');
      }

      const folder = `uploads/penelitian/${idPengajuan}`;
      const publicId = `${jenisDokumen}_${Date.now()}`;
      const resourceType = detectResourceType(req.file.mimetype);
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, folder, resourceType, publicId);

      const existing = await DokumenModel.getByPengajuanAndJenis(idPengajuan, jenisDokumen);
      if (!existing.success) {
        return R.serverError(res, 'Gagal cek dokumen sebelumnya');
      }

      const dokumenData = {
        jenis_dokumen: jenisDokumen,
        file_path: cloudinaryResult.secure_url,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        file_size: req.file.size
      };

      const upsert = await DokumenModel.upsertDokumen(idPengajuan, dokumenData);
      if (!upsert.success) {
        return R.serverError(res, 'Gagal menyimpan dokumen ke database');
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

module.exports = { DokumenRekomendasiPenelitianController, JENIS_DOKUMEN_PENELITIAN };
