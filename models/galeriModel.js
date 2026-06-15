const db = require('../config/db');

class GaleriModel {
  static async createGaleri(galeriData) {
    try {
      const query = `
        INSERT INTO galeri
        (id_user, judul, deskripsi, gambar, status)
        VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        galeriData.id_user,
        galeriData.judul,
        galeriData.deskripsi,
        galeriData.gambar,
        galeriData.status
      ];

      const [result] = await db.execute(query, values);

      return {
        success: true,
        id: result.insertId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async updateGaleri(idGaleri, galeriData) {
    try {
      const fields = [];
      const values = [];

      if (typeof galeriData.judul !== 'undefined') {
        fields.push('judul = ?');
        values.push(galeriData.judul);
      }

      if (typeof galeriData.deskripsi !== 'undefined') {
        fields.push('deskripsi = ?');
        values.push(galeriData.deskripsi);
      }

      if (typeof galeriData.gambar !== 'undefined') {
        fields.push('gambar = ?');
        values.push(galeriData.gambar);
      }

      if (typeof galeriData.status !== 'undefined') {
        fields.push('status = ?');
        values.push(galeriData.status);
      }

      if (fields.length === 0) {
        return { success: false, error: 'Tidak ada data yang diupdate' };
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');

      const query = `
        UPDATE galeri
        SET ${fields.join(', ')}
        WHERE id_galeri = ?
      `;

      values.push(idGaleri);

      const [result] = await db.execute(query, values);

      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async deleteGaleri(idGaleri) {
    try {
      const query = `
        DELETE FROM galeri
        WHERE id_galeri = ?
      `;

      const [result] = await db.execute(query, [idGaleri]);

      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getAllGaleriPublik() {
    try {
      const query = `
        SELECT id_galeri, judul, deskripsi, gambar, status, created_at, updated_at
        FROM galeri
        WHERE status = 'publish'
        ORDER BY created_at DESC
      `;

      const [rows] = await db.execute(query);

      return {
        success: true,
        data: rows
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getGaleriByIdPublik(idGaleri) {
    try {
      const query = `
        SELECT id_galeri, judul, deskripsi, gambar, status, created_at, updated_at
        FROM galeri
        WHERE id_galeri = ? AND status = 'publish'
        LIMIT 1
      `;

      const [rows] = await db.execute(query, [idGaleri]);

      return {
        success: true,
        data: rows[0] || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getAllGaleriAdmin() {
    try {
      const query = `
        SELECT id_galeri, id_user, judul, deskripsi, gambar, status, created_at, updated_at
        FROM galeri
        ORDER BY created_at DESC
      `;

      const [rows] = await db.execute(query);

      return {
        success: true,
        data: rows
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getGaleriById(idGaleri) {
    try {
      const query = `
        SELECT id_galeri, id_user, judul, deskripsi, gambar, status, created_at, updated_at
        FROM galeri
        WHERE id_galeri = ?
        LIMIT 1
      `;

      const [rows] = await db.execute(query, [idGaleri]);

      return {
        success: true,
        data: rows[0] || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GaleriModel;
