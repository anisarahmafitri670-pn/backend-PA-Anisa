const db = require('../config/db');
class UserModel {
  static async findByUsername(username) {
    try {
      const query = `
        SELECT *
        FROM users
        WHERE username = ?
        LIMIT 1
      `;
      const [rows] = await db.execute(query, [username]);
      return { success: true, data: rows[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async findByEmail(email) {
    try {
      const query = `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
      `;
      const [rows] = await db.execute(query, [email]);
      return { success: true, data: rows[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async findById(idUser) {
    try {
      const query = `
        SELECT *
        FROM users
        WHERE id_user = ?
        LIMIT 1
      `;
      const [rows] = await db.execute(query, [idUser]);
      return { success: true, data: rows[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async createUser({ nama, username, email, passwordHash, role }) {
    try {

      const values = [nama, username, email, passwordHash, role];

      // Prefer nama_lengkap (sesuai input register terbaru). Jika kolom tidak ada, fallback ke nama.
      let result;
      try {
        const queryNamaLengkap = `
          INSERT INTO users (nama_lengkap, username, email, password, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        [result] = await db.execute(queryNamaLengkap, values);
      } catch (error) {
        if (!String(error.message || '').includes("Unknown column 'nama_lengkap'")) {
          throw error;
        }

        const queryNama = `
          INSERT INTO users (nama, username, email, password, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        [result] = await db.execute(queryNama, values);
      }

      return { success: true, id: result.insertId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async deleteUser(idUser) {
    try {
      const query = `
        DELETE FROM users
        WHERE id_user = ?
      `;
      const [result] = await db.execute(query, [idUser]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = UserModel;
