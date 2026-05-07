const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistem_pelayanan_terpadu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

class UserModel {
  static async findByUsername(username) {
    let connection;
    try {
      connection = await pool.getConnection();
      const query = `
        SELECT *
        FROM users
        WHERE username = ?
        LIMIT 1
      `;
      const [rows] = await connection.execute(query, [username]);
      return { success: true, data: rows[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  static async findByEmail(email) {
    let connection;
    try {
      connection = await pool.getConnection();
      const query = `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
      `;
      const [rows] = await connection.execute(query, [email]);
      return { success: true, data: rows[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  static async findById(idUser) {
    let connection;
    try {
      connection = await pool.getConnection();
      const query = `
        SELECT *
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

  static async createUser({ nama, username, email, passwordHash, role }) {
    let connection;
    try {
      connection = await pool.getConnection();

      const values = [nama, username, email, passwordHash, role];

      // Prefer nama_lengkap (sesuai input register terbaru). Jika kolom tidak ada, fallback ke nama.
      let result;
      try {
        const queryNamaLengkap = `
          INSERT INTO users (nama_lengkap, username, email, password, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        [result] = await connection.execute(queryNamaLengkap, values);
      } catch (error) {
        if (!String(error.message || '').includes("Unknown column 'nama_lengkap'")) {
          throw error;
        }

        const queryNama = `
          INSERT INTO users (nama, username, email, password, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        [result] = await connection.execute(queryNama, values);
      }

      return { success: true, id: result.insertId };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteUser(idUser) {
    let connection;
    try {
      connection = await pool.getConnection();
      const query = `
        DELETE FROM users
        WHERE id_user = ?
      `;
      const [result] = await connection.execute(query, [idUser]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = UserModel;
