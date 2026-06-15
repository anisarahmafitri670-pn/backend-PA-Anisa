const db = require('../config/db');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan pengajuan rekomendasi surat kerja ke database
  static async savePengajuan(pengajuanData) {
    try {

      const query = `
        INSERT INTO rekomendasi_surat_kerja
        (id_user, nama_pemohon, alamat, nik, no_hp, keterangan)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const values = [
        pengajuanData.id_user,
        pengajuanData.nama_pemohon,
        pengajuanData.alamat,
        pengajuanData.nik,
        pengajuanData.no_hp,
        pengajuanData.keterangan
      ];

      const [result] = await db.execute(query, values);

      return {
        success: true,
        id: result.insertId,
        message: 'Pengajuan rekomendasi surat kerja berhasil disimpan'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update pengajuan rekomendasi surat kerja
  static async updatePengajuan(idPengajuan, pengajuanData, idUser = null) {
    try {

      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';
      const query = `
        UPDATE rekomendasi_surat_kerja
        SET nama_pemohon = ?,
            alamat = ?,
            nik = ?,
            no_hp = ?,
            keterangan = ?
        ${whereClause}
      `;

      const values = [
        pengajuanData.nama_pemohon,
        pengajuanData.alamat,
        pengajuanData.nik,
        pengajuanData.no_hp,
        pengajuanData.keterangan,
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

  // Hapus pengajuan rekomendasi surat kerja
  static async deletePengajuan(idPengajuan, idUser = null) {
    try {

      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';
      const query = `
        DELETE FROM rekomendasi_surat_kerja
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

  // Ambil semua pengajuan rekomendasi surat kerja
  static async getAllPengajuan(idUser = null) {
    try {

      const whereClause = idUser ? 'WHERE id_user = ?' : '';
      const query = `
        SELECT * FROM rekomendasi_surat_kerja
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

  // Ambil pengajuan rekomendasi surat kerja berdasarkan ID
  static async getPengajuanById(idPengajuan, idUser = null) {
    try {

      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';
      const query = `
        SELECT * FROM rekomendasi_surat_kerja
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
