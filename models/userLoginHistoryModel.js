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

class UserLoginHistoryModel {
  static async createHistory({ id_user, aktivitas }) {
    let connection;
    try {
      connection = await pool.getConnection();
      const query = `
        INSERT INTO user_login_history (id_user, aktivitas, waktu)
        VALUES (?, ?, NOW())
      `;
      const [result] = await connection.execute(query, [id_user, aktivitas]);
      return { success: true, id: result.insertId };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  static async getHistoryByUserId(idUser) {
    let connection;
    try {
      connection = await pool.getConnection();
      const query = `
        SELECT aktivitas, DATE_FORMAT(waktu, '%Y-%m-%d %H:%i:%s') AS waktu
        FROM user_login_history
        WHERE id_user = ?
        ORDER BY waktu DESC
      `;
      const [rows] = await connection.execute(query, [idUser]);
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = UserLoginHistoryModel;
