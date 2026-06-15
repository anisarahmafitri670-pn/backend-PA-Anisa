const db = require('../config/db');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan pengajuan rekomendasi kartu keluarga ke database
  static async savePengajuan(pengajuanData) {
    try {

      const query = `
        INSERT INTO rekomendasi_kartu_keluarga
        (id_user, nama_pemohon, alamat, nik, no_hp)
        VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        pengajuanData.id_user,
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
  static async updatePengajuan(idPengajuan, pengajuanData, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        UPDATE rekomendasi_kartu_keluarga
        SET nama_pemohon = ?,
            alamat = ?,
            nik = ?,
            no_hp = ?
        ${whereClause}
      `;

      const values = [
        pengajuanData.nama_pemohon,
        pengajuanData.alamat,
        pengajuanData.nik,
        pengajuanData.no_hp,
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

  // Hapus pengajuan rekomendasi kartu keluarga
  static async deletePengajuan(idPengajuan, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        DELETE FROM rekomendasi_kartu_keluarga
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

  // Ambil semua pengajuan rekomendasi kartu keluarga
  static async getAllPengajuan(idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_user = ?' : '';

      const query = `
        SELECT * FROM rekomendasi_kartu_keluarga
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

  // Ambil pengajuan rekomendasi kartu keluarga berdasarkan ID
  static async getPengajuanById(idPengajuan, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        SELECT * FROM rekomendasi_kartu_keluarga
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
