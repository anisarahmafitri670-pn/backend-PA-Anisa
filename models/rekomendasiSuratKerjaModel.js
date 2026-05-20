const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi koneksi MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistem_pelayanan_terpadu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

class Database {
  // Simpan pengajuan rekomendasi surat kerja ke database
  static async savePengajuan(pengajuanData) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        INSERT INTO rekomendasi_surat_kerja
        (nama_pemohon, alamat, nik, no_hp, keterangan)
        VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        pengajuanData.nama_pemohon,
        pengajuanData.alamat,
        pengajuanData.nik,
        pengajuanData.no_hp,
        pengajuanData.keterangan
      ];

      const [result] = await connection.execute(query, values);

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
    } finally {
      if (connection) connection.release();
    }
  }

  // Update pengajuan rekomendasi surat kerja
  static async updatePengajuan(idPengajuan, pengajuanData) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        UPDATE rekomendasi_surat_kerja
        SET nama_pemohon = ?,
            alamat = ?,
            nik = ?,
            no_hp = ?,
            keterangan = ?
        WHERE id_pengajuan = ?
      `;

      const values = [
        pengajuanData.nama_pemohon,
        pengajuanData.alamat,
        pengajuanData.nik,
        pengajuanData.no_hp,
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

  // Hapus pengajuan rekomendasi surat kerja
  static async deletePengajuan(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        DELETE FROM rekomendasi_surat_kerja
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

  // Ambil semua pengajuan rekomendasi surat kerja
  static async getAllPengajuan() {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        SELECT * FROM rekomendasi_surat_kerja
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

  // Ambil pengajuan rekomendasi surat kerja berdasarkan ID
  static async getPengajuanById(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        SELECT * FROM rekomendasi_surat_kerja
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
