const db = require('../config/db');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan pengajuan rekomendasi surat ahli waris ke database
  static async savePengajuan(pengajuanData) {
    try {

      const query = `
        INSERT INTO rekomendasi_surat_ahli_waris
        (nama_pewaris, nik_pewaris, alamat_pewaris, nama_pemohon, nik_pemohon, alamat_pemohon, no_hp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        pengajuanData.nama_pewaris,
        pengajuanData.nik_pewaris,
        pengajuanData.alamat_pewaris,
        pengajuanData.nama_pemohon,
        pengajuanData.nik_pemohon,
        pengajuanData.alamat_pemohon,
        pengajuanData.no_hp
      ];

      const [result] = await db.execute(query, values);

      return {
        success: true,
        id: result.insertId,
        message: 'Pengajuan rekomendasi surat ahli waris berhasil disimpan'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update pengajuan rekomendasi surat ahli waris
  static async updatePengajuan(idPengajuan, pengajuanData) {
    try {

      const query = `
        UPDATE rekomendasi_surat_ahli_waris
        SET nama_pewaris = ?,
            nik_pewaris = ?,
            alamat_pewaris = ?,
            nama_pemohon = ?,
            nik_pemohon = ?,
            alamat_pemohon = ?,
            no_hp = ?
        WHERE id_pengajuan = ?
      `;

      const values = [
        pengajuanData.nama_pewaris,
        pengajuanData.nik_pewaris,
        pengajuanData.alamat_pewaris,
        pengajuanData.nama_pemohon,
        pengajuanData.nik_pemohon,
        pengajuanData.alamat_pemohon,
        pengajuanData.no_hp,
        idPengajuan
      ];

      const [result] = await db.execute(query, values);

      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Hapus pengajuan rekomendasi surat ahli waris
  static async deletePengajuan(idPengajuan) {
    try {

      const query = `
        DELETE FROM rekomendasi_surat_ahli_waris
        WHERE id_pengajuan = ?
      `;

      const [result] = await db.execute(query, [idPengajuan]);

      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Ambil semua pengajuan rekomendasi surat ahli waris
  static async getAllPengajuan() {
    try {

      const query = `
        SELECT * FROM rekomendasi_surat_ahli_waris
        ORDER BY created_at DESC
      `;

      const [rows] = await db.execute(query);

      return {
        success: true,
        data: rows
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Ambil pengajuan rekomendasi surat ahli waris berdasarkan ID
  static async getPengajuanById(idPengajuan) {
    try {

      const query = `
        SELECT * FROM rekomendasi_surat_ahli_waris
        WHERE id_pengajuan = ?
      `;

      const [rows] = await db.execute(query, [idPengajuan]);

      return {
        success: true,
        data: rows[0] || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = Database;
