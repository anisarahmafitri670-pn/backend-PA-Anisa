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

class ProfileModel {
  static async findById(idUser) {
    let connection;
    try {
      connection = await pool.getConnection();
      const query = `
        SELECT id_user, nama_lengkap, email, username, role, no_hp, alamat, avatar
        FROM users
        WHERE id_user = ?
        LIMIT 1
      `;
      const [rows] = await connection.execute(query, [idUser]);
      return { success: true, data: rows[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateProfile(idUser, profileData) {
    let connection;
    try {
      connection = await pool.getConnection();
      const query = `
        UPDATE users
        SET nama_lengkap = ?, username = ?, no_hp = ?, alamat = ?, updated_at = NOW()
        WHERE id_user = ?
      `;
      const values = [
        profileData.nama_lengkap,
        profileData.username,
        profileData.no_hp,
        profileData.alamat,
        idUser
      ];
      const [result] = await connection.execute(query, values);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateAvatar(idUser, avatarPath) {
    let connection;
    try {
      connection = await pool.getConnection();
      const query = `
        UPDATE users
        SET avatar = ?, updated_at = NOW()
        WHERE id_user = ?
      `;
      const [result] = await connection.execute(query, [avatarPath, idUser]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = ProfileModel;
