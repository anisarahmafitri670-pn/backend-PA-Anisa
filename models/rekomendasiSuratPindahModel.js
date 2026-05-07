const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi koneksi MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistem_pelayanan_terpadu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

class Database {
  // Simpan pengajuan rekomendasi surat pindah ke database
  static async savePengajuan(pengajuanData) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        INSERT INTO rekomendasi_surat_pindah
        (nama_lengkap, alamat_asal, alamat_pindah, keterangan)
        VALUES (?, ?, ?, ?)
      `;

      const values = [
        pengajuanData.nama_lengkap,
        pengajuanData.alamat_asal,
        pengajuanData.alamat_pindah,
        pengajuanData.keterangan
      ];

      const [result] = await connection.execute(query, values);

      return {
        success: true,
        id: result.insertId,
        message: 'Pengajuan rekomendasi surat pindah berhasil disimpan'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // Update pengajuan rekomendasi surat pindah
  static async updatePengajuan(idPengajuan, pengajuanData) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        UPDATE rekomendasi_surat_pindah
        SET nama_lengkap = ?,
            alamat_asal = ?,
            alamat_pindah = ?,
            keterangan = ?
        WHERE id_pengajuan = ?
      `;

      const values = [
        pengajuanData.nama_lengkap,
        pengajuanData.alamat_asal,
        pengajuanData.alamat_pindah,
        pengajuanData.keterangan,
        idPengajuan
      ];

      const [result] = await connection.execute(query, values);

      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // Hapus pengajuan rekomendasi surat pindah
  static async deletePengajuan(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        DELETE FROM rekomendasi_surat_pindah
        WHERE id_pengajuan = ?
      `;

      const [result] = await connection.execute(query, [idPengajuan]);

      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // Ambil semua pengajuan rekomendasi surat pindah
  static async getAllPengajuan() {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        SELECT * FROM rekomendasi_surat_pindah
        ORDER BY created_at DESC
      `;

      const [rows] = await connection.execute(query);

      return {
        success: true,
        data: rows
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // Ambil pengajuan rekomendasi surat pindah berdasarkan ID
  static async getPengajuanById(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        SELECT * FROM rekomendasi_surat_pindah
        WHERE id_pengajuan = ?
      `;

      const [rows] = await connection.execute(query, [idPengajuan]);

      return {
        success: true,
        data: rows[0] || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = Database;

