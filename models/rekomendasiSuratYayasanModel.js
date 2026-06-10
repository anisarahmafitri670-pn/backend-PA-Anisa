const db = require('../config/db');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan pengajuan rekomendasi surat yayasan ke database
  static async savePengajuan(pengajuanData) {
    try {

      const query = `
        INSERT INTO rekomendasi_surat_yayasan
        (nama_pemohon, nik, jabatan, nama_lembaga, alamat_lembaga)
        VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        pengajuanData.nama_pemohon,
        pengajuanData.nik,
        pengajuanData.jabatan,
        pengajuanData.nama_lembaga,
        pengajuanData.alamat_lembaga
      ];

      const [result] = await db.execute(query, values);

      return {
        success: true,
        id: result.insertId,
        message: 'Pengajuan rekomendasi surat yayasan berhasil disimpan'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update pengajuan rekomendasi surat yayasan
  static async updatePengajuan(idPengajuan, pengajuanData) {
    try {

      const query = `
        UPDATE rekomendasi_surat_yayasan
        SET nama_pemohon = ?,
            nik = ?,
            jabatan = ?,
            nama_lembaga = ?,
            alamat_lembaga = ?
        WHERE id_pengajuan = ?
      `;

      const values = [
        pengajuanData.nama_pemohon,
        pengajuanData.nik,
        pengajuanData.jabatan,
        pengajuanData.nama_lembaga,
        pengajuanData.alamat_lembaga,
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

  // Hapus pengajuan rekomendasi surat yayasan
  static async deletePengajuan(idPengajuan) {
    try {

      const query = `
        DELETE FROM rekomendasi_surat_yayasan
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

  // Ambil semua pengajuan rekomendasi surat yayasan
  static async getAllPengajuan() {
    try {

      const query = `
        SELECT * FROM rekomendasi_surat_yayasan
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

  // Ambil pengajuan rekomendasi surat yayasan berdasarkan ID
  static async getPengajuanById(idPengajuan) {
    try {

      const query = `
        SELECT * FROM rekomendasi_surat_yayasan
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
