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
  // Simpan pengajuan rekomendasi surat ahli waris ke database
  static async savePengajuan(pengajuanData) {
    let connection;
    try {
      connection = await pool.getConnection();

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

      const [result] = await connection.execute(query, values);

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
    } finally {
      if (connection) connection.release();
    }
  }

  // Update pengajuan rekomendasi surat ahli waris
  static async updatePengajuan(idPengajuan, pengajuanData) {
    let connection;
    try {
      connection = await pool.getConnection();

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

  // Hapus pengajuan rekomendasi surat ahli waris
  static async deletePengajuan(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        DELETE FROM rekomendasi_surat_ahli_waris
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

  // Ambil semua pengajuan rekomendasi surat ahli waris
  static async getAllPengajuan() {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        SELECT * FROM rekomendasi_surat_ahli_waris
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

  // Ambil pengajuan rekomendasi surat ahli waris berdasarkan ID
  static async getPengajuanById(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        SELECT * FROM rekomendasi_surat_ahli_waris
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
