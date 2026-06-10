const db = require('../config/db');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan pengajuan rekomendasi akta kelahiran ke database
  static async savePengajuan(pengajuanData) {
    try {

      const query = `
        INSERT INTO rekomendasi_akta_kelahiran
        (nama_pemohon, alamat, nik, no_hp)
        VALUES (?, ?, ?, ?)
      `;

      const values = [
        pengajuanData.nama_pemohon,
        pengajuanData.alamat,
        pengajuanData.nik,
        pengajuanData.no_hp
      ];

      const [result] = await db.execute(query, values);

      return {
        success: true,
        id: result.insertId,
        message: 'Pengajuan rekomendasi akta kelahiran berhasil disimpan'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update pengajuan rekomendasi akta kelahiran
  static async updatePengajuan(idPengajuan, pengajuanData) {
    try {

      const query = `
        UPDATE rekomendasi_akta_kelahiran
        SET nama_pemohon = ?,
            alamat = ?,
            nik = ?,
            no_hp = ?
        WHERE id_pengajuan = ?
      `;

      const values = [
        pengajuanData.nama_pemohon,
        pengajuanData.alamat,
        pengajuanData.nik,
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

  // Hapus pengajuan rekomendasi akta kelahiran
  static async deletePengajuan(idPengajuan) {
    try {

      const query = `
        DELETE FROM rekomendasi_akta_kelahiran
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

  // Ambil semua pengajuan rekomendasi akta kelahiran
  static async getAllPengajuan() {
    try {

      const query = `
        SELECT * FROM rekomendasi_akta_kelahiran
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

  // Ambil pengajuan rekomendasi akta kelahiran berdasarkan ID
  static async getPengajuanById(idPengajuan) {
    try {

      const query = `
        SELECT * FROM rekomendasi_akta_kelahiran
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
