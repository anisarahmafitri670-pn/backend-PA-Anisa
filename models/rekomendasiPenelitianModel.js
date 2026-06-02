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
  // Simpan data rekomendasi penelitian ke database
  static async saveRekomendasi(rekomendasiData) {
    let connection;
    try {
      connection = await pool.getConnection();

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

      const [result] = await connection.execute(query, values);

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
    } finally {
      if (connection) connection.release();
    }
  }

  // Update data rekomendasi penelitian
  static async updateRekomendasi(idPengajuan, rekomendasiData) {
    let connection;
    try {
      connection = await pool.getConnection();

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

  // Hapus data rekomendasi penelitian
  static async deleteRekomendasi(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        DELETE FROM rekomendasi_penelitian
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

  // Ambil semua rekomendasi penelitian
  static async getAllRekomendasi() {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        SELECT * FROM rekomendasi_penelitian 
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

  // Ambil rekomendasi penelitian berdasarkan ID
  static async getRekomendasiById(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        SELECT * FROM rekomendasi_penelitian 
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
