const db = require('../config/db');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan data rekomendasi penelitian ke database
  static async saveRekomendasi(rekomendasiData) {
    try {

      const query = `
        INSERT INTO rekomendasi_penelitian 
        (nama_peneliti, instansi, topik_penelitian, lokasi_penelitian, waktu_penelitian)
        VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        rekomendasiData.nama_peneliti,
        rekomendasiData.instansi,
        rekomendasiData.topik_penelitian,
        rekomendasiData.lokasi_penelitian,
        rekomendasiData.waktu_penelitian
      ];

      const [result] = await db.execute(query, values);

      return {
        success: true,
        id: result.insertId,
        message: 'Data rekomendasi penelitian berhasil disimpan'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update data rekomendasi penelitian
  static async updateRekomendasi(idPengajuan, rekomendasiData) {
    try {

      const query = `
        UPDATE rekomendasi_penelitian 
        SET nama_peneliti = ?,
            instansi = ?,
            topik_penelitian = ?,
            lokasi_penelitian = ?,
            waktu_penelitian = ?
        WHERE id_pengajuan = ?
      `;

      const values = [
        rekomendasiData.nama_peneliti,
        rekomendasiData.instansi,
        rekomendasiData.topik_penelitian,
        rekomendasiData.lokasi_penelitian,
        rekomendasiData.waktu_penelitian,
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

  // Hapus data rekomendasi penelitian
  static async deleteRekomendasi(idPengajuan) {
    try {

      const query = `
        DELETE FROM rekomendasi_penelitian
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

  // Ambil semua rekomendasi penelitian
  static async getAllRekomendasi() {
    try {

      const query = `
        SELECT * FROM rekomendasi_penelitian 
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

  // Ambil rekomendasi penelitian berdasarkan ID
  static async getRekomendasiById(idPengajuan) {
    try {

      const query = `
        SELECT * FROM rekomendasi_penelitian 
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
