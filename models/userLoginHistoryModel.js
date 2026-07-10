const db = require('../config/db');
class UserLoginHistoryModel {
  static async createHistory({ id_user, aktivitas }) {
    try {
      const query = `
        INSERT INTO user_login_history (id_user, aktivitas, waktu)
        VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 HOUR))
      `;
      const [result] = await db.execute(query, [id_user, aktivitas]);

      const [rows] = await db.execute(
        `
          SELECT id_history, aktivitas, DATE_FORMAT(waktu, '%Y-%m-%d %H:%i:%s') AS waktu
          FROM user_login_history
          WHERE id_history = ?
          LIMIT 1
        `,
        [result.insertId]
      );

      return { success: true, id: result.insertId, data: rows[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getHistoryByUserId(idUser) {
    try {
      const query = `
        SELECT aktivitas, DATE_FORMAT(waktu, '%Y-%m-%d %H:%i:%s') AS waktu
        FROM user_login_history
        WHERE id_user = ?
        ORDER BY waktu DESC
      `;
      const [rows] = await db.execute(query, [idUser]);
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = UserLoginHistoryModel;
