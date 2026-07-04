const db = require('../config/db');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { buildPengajuanFilters } = require('../utils/pengajuanListFilters');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan pengajuan rekomendasi surat pindah ke database
  static async savePengajuan(pengajuanData) {
    try {

      const query = `
        INSERT INTO rekomendasi_surat_pindah
        (id_user, nama_lengkap, alamat_asal, alamat_pindah, keterangan)
        VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        pengajuanData.id_user,
        pengajuanData.nama_lengkap,
        pengajuanData.alamat_asal,
        pengajuanData.alamat_pindah,
        pengajuanData.keterangan
      ];

      const [result] = await db.execute(query, values);

      return {
        success: true,
        id: result.insertId,
        message: 'Pengajuan rekomendasi surat pindah berhasil disimpan'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update pengajuan rekomendasi surat pindah
  static async updatePengajuan(idPengajuan, pengajuanData, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        UPDATE rekomendasi_surat_pindah
        SET nama_lengkap = ?,
            alamat_asal = ?,
            alamat_pindah = ?,
            keterangan = ?
        ${whereClause}
      `;

      const values = [
        pengajuanData.nama_lengkap,
        pengajuanData.alamat_asal,
        pengajuanData.alamat_pindah,
        pengajuanData.keterangan,
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

  // Hapus pengajuan rekomendasi surat pindah
  static async deletePengajuan(idPengajuan, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        DELETE FROM rekomendasi_surat_pindah
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

  // Ambil semua pengajuan rekomendasi surat pindah
  static async getAllPengajuan(idUser = null, paginationOptions = null) {
    try {
      const { whereClause, values } = buildPengajuanFilters({
        idUser,
        query: paginationOptions || {},
        keywordColumns: ['nama_lengkap', 'alamat_asal', 'alamat_pindah', 'keterangan']
      });

      if (paginationOptions) {
        const { page, limit, offset } = parsePagination(paginationOptions);
        const [countRows] = await db.execute(
          `SELECT COUNT(*) AS total FROM rekomendasi_surat_pindah ${whereClause}`,
          values
        );

        const [rows] = await db.execute(
          `
            SELECT * FROM rekomendasi_surat_pindah
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
        SELECT * FROM rekomendasi_surat_pindah
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

  // Ambil pengajuan rekomendasi surat pindah berdasarkan ID
  static async getPengajuanById(idPengajuan, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        SELECT * FROM rekomendasi_surat_pindah
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
