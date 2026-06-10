const db = require('../config/db');
class ProfileModel {
  static async findById(idUser) {
    try {
      const query = `
        SELECT id_user, nama_lengkap, email, username, role, no_hp, alamat, avatar
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

  static async updateProfile(idUser, profileData) {
    try {
      const query = `
        UPDATE users
        SET nama_lengkap = ?, username = ?, email = ?, no_hp = ?, alamat = ?, updated_at = NOW()
        WHERE id_user = ?
      `;
      const values = [
        profileData.nama_lengkap,
        profileData.username,
        profileData.email,
        profileData.no_hp,
        profileData.alamat,
        idUser
      ];
      const [result] = await db.execute(query, values);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async updateAvatar(idUser, avatarPath) {
    try {
      const query = `
        UPDATE users
        SET avatar = ?, updated_at = NOW()
        WHERE id_user = ?
      `;
      const [result] = await db.execute(query, [avatarPath, idUser]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = ProfileModel;
