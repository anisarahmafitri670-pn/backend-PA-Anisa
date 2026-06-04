const mysql = require('mysql2/promise');
require('dotenv').config();

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

const TABLE_NAME = 'dokumen_rekomendasi_penelitian';

class DokumenRekomendasiPenelitianModel {
  static async getByPengajuanAndJenis(idPengajuan, jenisDokumen) {
    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.execute(
        `SELECT * FROM ${TABLE_NAME} WHERE id_pengajuan = ? AND jenis_dokumen = ? LIMIT 1`,
        [idPengajuan, jenisDokumen]
      );
      return { success: true, data: rows[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  static async upsertDokumen(idPengajuan, dokumenData) {
    let connection;
    try {
      connection = await pool.getConnection();

      const query = `
        INSERT INTO ${TABLE_NAME}
          (id_pengajuan, jenis_dokumen, file_path, original_name, mime_type, file_size, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
          file_path = VALUES(file_path),
          original_name = VALUES(original_name),
          mime_type = VALUES(mime_type),
          file_size = VALUES(file_size),
          uploaded_at = CURRENT_TIMESTAMP
      `;

      const values = [
        idPengajuan,
        dokumenData.jenis_dokumen,
        dokumenData.file_path,
        dokumenData.original_name,
        dokumenData.mime_type,
        dokumenData.file_size
      ];

      const [result] = await connection.execute(query, values);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  static async listByPengajuan(idPengajuan) {
    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.execute(
        `SELECT * FROM ${TABLE_NAME} WHERE id_pengajuan = ? ORDER BY uploaded_at DESC`,
        [idPengajuan]
      );
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteByPengajuanAndJenis(idPengajuan, jenisDokumen) {
    let connection;
    try {
      connection = await pool.getConnection();
      const [result] = await connection.execute(
        `DELETE FROM ${TABLE_NAME} WHERE id_pengajuan = ? AND jenis_dokumen = ?`,
        [idPengajuan, jenisDokumen]
      );
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = DokumenRekomendasiPenelitianModel;
