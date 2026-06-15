const db = require('../config/db');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan data rekomendasi penelitian ke database
  static async saveRekomendasi(rekomendasiData) {
    try {

      const query = `
        INSERT INTO rekomendasi_penelitian 
        (id_user, nama_peneliti, instansi, topik_penelitian, lokasi_penelitian, waktu_penelitian)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const values = [
        rekomendasiData.id_user,
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
  static async updateRekomendasi(idPengajuan, rekomendasiData, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        UPDATE rekomendasi_penelitian 
        SET nama_peneliti = ?,
            instansi = ?,
            topik_penelitian = ?,
            lokasi_penelitian = ?,
            waktu_penelitian = ?
        ${whereClause}
      `;

      const values = [
        rekomendasiData.nama_peneliti,
        rekomendasiData.instansi,
        rekomendasiData.topik_penelitian,
        rekomendasiData.lokasi_penelitian,
        rekomendasiData.waktu_penelitian,
        idPengajuan
      ];

      if (idUser) {
        values.push(idUser);
      }

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
  static async deleteRekomendasi(idPengajuan, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        DELETE FROM rekomendasi_penelitian
        ${whereClause}
      `;

      const values = [idPengajuan];
      if (idUser) {
        values.push(idUser);
      }

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

  // Ambil semua rekomendasi penelitian
  static async getAllRekomendasi(idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_user = ?' : '';

      const query = `
        SELECT * FROM rekomendasi_penelitian 
        ${whereClause}
        ORDER BY created_at DESC
      `;

      const values = idUser ? [idUser] : [];
      const [rows] = await db.execute(query, values);

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
  static async getRekomendasiById(idPengajuan, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        SELECT * FROM rekomendasi_penelitian 
        ${whereClause}
      `;

      const values = [idPengajuan];
      if (idUser) {
        values.push(idUser);
      }

      const [rows] = await db.execute(query, values);

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
