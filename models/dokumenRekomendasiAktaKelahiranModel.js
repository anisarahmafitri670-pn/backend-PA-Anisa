const db = require('../config/db');

const TABLE_NAME = 'dokumen_rekomendasi_akta_kelahiran';

class DokumenRekomendasiAktaKelahiranModel {
  static async getByPengajuanAndJenis(idPengajuan, jenisDokumen) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM ${TABLE_NAME} WHERE id_pengajuan = ? AND jenis_dokumen = ? LIMIT 1`,
        [idPengajuan, jenisDokumen]
      );
      return { success: true, data: rows[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async upsertDokumen(idPengajuan, dokumenData) {
    try {

      const query = `
        INSERT INTO ${TABLE_NAME}
          (id_pengajuan, jenis_dokumen, file_path, original_name, mime_type, file_size, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
          file_path = VALUES(file_path),
          original_name = VALUES(original_name),
          mime_type = VALUES(mime_type),
          file_size = VALUES(file_size),
          uploaded_at = CURRENT_TIMESTAMP
      `;

      const values = [
        idPengajuan,
        dokumenData.jenis_dokumen,
        dokumenData.file_path,
        dokumenData.original_name,
        dokumenData.mime_type,
        dokumenData.file_size
      ];

      const [result] = await db.execute(query, values);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async listByPengajuan(idPengajuan) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM ${TABLE_NAME} WHERE id_pengajuan = ? ORDER BY uploaded_at DESC`,
        [idPengajuan]
      );
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async deleteByPengajuanAndJenis(idPengajuan, jenisDokumen) {
    try {
      const [result] = await db.execute(
        `DELETE FROM ${TABLE_NAME} WHERE id_pengajuan = ? AND jenis_dokumen = ?`,
        [idPengajuan, jenisDokumen]
      );
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = DokumenRekomendasiAktaKelahiranModel;
