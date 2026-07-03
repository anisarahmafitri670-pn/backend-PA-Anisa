const db = require('../config/db');

const GALERI_FIELDS = `
  id_galeri,
  judul,
  deskripsi_singkat,
  deskripsi_detail,
  tanggal_kegiatan,
  lokasi,
  foto_url,
  tipe_tampilan,
  urutan_tampil,
  status_aktif,
  created_by,
  created_at,
  updated_at
`;

class GaleriModel {
  static async getPublicGaleri(tipeTampilan) {
    const params = [];
    let query = `
      SELECT ${GALERI_FIELDS}
      FROM galeri
      WHERE status_aktif = 1
    `;

    if (tipeTampilan) {
      query += ' AND tipe_tampilan = ?';
      params.push(tipeTampilan);
    }

    query += ' ORDER BY urutan_tampil ASC, created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getAllAdmin() {
    const [rows] = await db.execute(`
      SELECT ${GALERI_FIELDS}
      FROM galeri
      ORDER BY urutan_tampil ASC, created_at DESC
    `);
    return rows;
  }

  static async getById(idGaleri) {
    const [rows] = await db.execute(
      `SELECT ${GALERI_FIELDS} FROM galeri WHERE id_galeri = ? LIMIT 1`,
      [idGaleri]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await db.execute(
      `INSERT INTO galeri (
        judul,
        deskripsi_singkat,
        deskripsi_detail,
        tanggal_kegiatan,
        lokasi,
        foto_url,
        tipe_tampilan,
        urutan_tampil,
        status_aktif,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.judul,
        data.deskripsi_singkat,
        data.deskripsi_detail,
        data.tanggal_kegiatan,
        data.lokasi,
        data.foto_url,
        data.tipe_tampilan,
        data.urutan_tampil,
        data.status_aktif,
        data.created_by
      ]
    );

    return result.insertId;
  }

  static async update(idGaleri, data) {
    const fields = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    if (fields.length === 0) {
      return { affectedRows: 0 };
    }

    values.push(idGaleri);
    const [result] = await db.execute(
      `UPDATE galeri SET ${fields.join(', ')} WHERE id_galeri = ?`,
      values
    );

    return result;
  }

  static async updateStatus(idGaleri, statusAktif) {
    const [result] = await db.execute(
      'UPDATE galeri SET status_aktif = ? WHERE id_galeri = ?',
      [statusAktif, idGaleri]
    );

    return result;
  }

  static async delete(idGaleri) {
    const [result] = await db.execute(
      'DELETE FROM galeri WHERE id_galeri = ?',
      [idGaleri]
    );

    return result;
  }
}

module.exports = GaleriModel;
