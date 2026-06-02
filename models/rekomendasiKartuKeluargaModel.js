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

// Test database connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database AlwaysData Connected');
    connection.release();
  } catch (error) {
    console.error('❌ Database Connection Failed');
    console.error(error);
  }
})();

class Database {
  // Simpan pengajuan rekomendasi kartu keluarga ke database
  static async savePengajuan(pengajuanData) {
    let connection;
    try {
      connection = await pool.getConnection();

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

      const [result] = await connection.execute(query, values);

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
    } finally {
      if (connection) connection.release();
    }
  }

  // Update pengajuan rekomendasi kartu keluarga
  static async updatePengajuan(idPengajuan, pengajuanData) {
    let connection;
    try {
      connection = await pool.getConnection();

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

  // Hapus pengajuan rekomendasi kartu keluarga
  static async deletePengajuan(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        DELETE FROM rekomendasi_kartu_keluarga
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

  // Ambil semua pengajuan rekomendasi kartu keluarga
  static async getAllPengajuan() {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        SELECT * FROM rekomendasi_kartu_keluarga
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

  // Ambil pengajuan rekomendasi kartu keluarga berdasarkan ID
  static async getPengajuanById(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        SELECT * FROM rekomendasi_kartu_keluarga
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
