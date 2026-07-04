const db = require('../config/db');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { buildPengajuanFilters } = require('../utils/pengajuanListFilters');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan pengajuan rekomendasi surat yayasan ke database
  static async savePengajuan(pengajuanData) {
    try {

      const query = `
        INSERT INTO rekomendasi_surat_yayasan
        (id_user, nama_pemohon, nik, jabatan, nama_lembaga, alamat_lembaga)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const values = [
        pengajuanData.id_user,
        pengajuanData.nama_pemohon,
        pengajuanData.nik,
        pengajuanData.jabatan,
        pengajuanData.nama_lembaga,
        pengajuanData.alamat_lembaga
      ];

      const [result] = await db.execute(query, values);

      return {
        success: true,
        id: result.insertId,
        message: 'Pengajuan rekomendasi surat yayasan berhasil disimpan'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update pengajuan rekomendasi surat yayasan
  static async updatePengajuan(idPengajuan, pengajuanData, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        UPDATE rekomendasi_surat_yayasan
        SET nama_pemohon = ?,
            nik = ?,
            jabatan = ?,
            nama_lembaga = ?,
            alamat_lembaga = ?
        ${whereClause}
      `;

      const values = [
        pengajuanData.nama_pemohon,
        pengajuanData.nik,
        pengajuanData.jabatan,
        pengajuanData.nama_lembaga,
        pengajuanData.alamat_lembaga,
        idPengajuan
      ];

      if (idUser) {
        values.push(idUser);
      }

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

  // Hapus pengajuan rekomendasi surat yayasan
  static async deletePengajuan(idPengajuan, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        DELETE FROM rekomendasi_surat_yayasan
        ${whereClause}
      `;

      const values = [idPengajuan];
      if (idUser) {
        values.push(idUser);
      }

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

  // Ambil semua pengajuan rekomendasi surat yayasan
  static async getAllPengajuan(idUser = null, paginationOptions = null) {
    try {
      const { whereClause, values } = buildPengajuanFilters({
        idUser,
        query: paginationOptions || {},
        keywordColumns: ['nama_pemohon', 'nik', 'jabatan', 'nama_lembaga', 'alamat_lembaga']
      });

      if (paginationOptions) {
        const { page, limit, offset } = parsePagination(paginationOptions);
        const [countRows] = await db.execute(
          `SELECT COUNT(*) AS total FROM rekomendasi_surat_yayasan ${whereClause}`,
          values
        );

        const [rows] = await db.execute(
          `
            SELECT * FROM rekomendasi_surat_yayasan
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
          `,
          [...values, limit, offset]
        );

        return {
          success: true,
          data: rows,
          pagination: buildPagination(countRows[0].total, page, limit, rows.length)
        };
      }

      const query = `
        SELECT * FROM rekomendasi_surat_yayasan
        ${whereClause}
        ORDER BY created_at DESC
      `;

      const [rows] = await db.execute(query, values);

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

  // Ambil pengajuan rekomendasi surat yayasan berdasarkan ID
  static async getPengajuanById(idPengajuan, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        SELECT * FROM rekomendasi_surat_yayasan
        ${whereClause}
      `;

      const values = [idPengajuan];
      if (idUser) {
        values.push(idUser);
      }

      const [rows] = await db.execute(query, values);

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

module.exports = Database;
