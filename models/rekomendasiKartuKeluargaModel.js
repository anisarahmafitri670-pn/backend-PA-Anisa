const db = require('../config/db');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan pengajuan rekomendasi kartu keluarga ke database
  static async savePengajuan(pengajuanData) {
    try {

      const query = `
        INSERT INTO rekomendasi_kartu_keluarga
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
        message: 'Pengajuan rekomendasi kartu keluarga berhasil disimpan'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update pengajuan rekomendasi kartu keluarga
  static async updatePengajuan(idPengajuan, pengajuanData) {
    try {

      const query = `
        UPDATE rekomendasi_kartu_keluarga
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

  // Hapus pengajuan rekomendasi kartu keluarga
  static async deletePengajuan(idPengajuan) {
    try {

      const query = `
        DELETE FROM rekomendasi_kartu_keluarga
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

  // Ambil semua pengajuan rekomendasi kartu keluarga
  static async getAllPengajuan() {
    try {

      const query = `
        SELECT * FROM rekomendasi_kartu_keluarga
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

  // Ambil pengajuan rekomendasi kartu keluarga berdasarkan ID
  static async getPengajuanById(idPengajuan) {
    try {

      const query = `
        SELECT * FROM rekomendasi_kartu_keluarga
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
