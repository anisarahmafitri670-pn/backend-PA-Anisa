const db = require('../config/db');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { buildPengajuanFilters } = require('../utils/pengajuanListFilters');
// Konfigurasi koneksi MySQL
class Database {
  // Simpan pengajuan rekomendasi surat ahli waris ke database
  static async savePengajuan(pengajuanData) {
    try {

      const query = `
        INSERT INTO rekomendasi_surat_ahli_waris
        (id_user, nama_pewaris, nik_pewaris, alamat_pewaris, nama_pemohon, nik_pemohon, alamat_pemohon, no_hp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        pengajuanData.id_user,
        pengajuanData.nama_pewaris,
        pengajuanData.nik_pewaris,
        pengajuanData.alamat_pewaris,
        pengajuanData.nama_pemohon,
        pengajuanData.nik_pemohon,
        pengajuanData.alamat_pemohon,
        pengajuanData.no_hp
      ];

      const [result] = await db.execute(query, values);

      return {
        success: true,
        id: result.insertId,
        message: 'Pengajuan rekomendasi surat ahli waris berhasil disimpan'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update pengajuan rekomendasi surat ahli waris
  static async updatePengajuan(idPengajuan, pengajuanData, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        UPDATE rekomendasi_surat_ahli_waris
        SET nama_pewaris = ?,
            nik_pewaris = ?,
            alamat_pewaris = ?,
            nama_pemohon = ?,
            nik_pemohon = ?,
            alamat_pemohon = ?,
            no_hp = ?
        ${whereClause}
      `;

      const values = [
        pengajuanData.nama_pewaris,
        pengajuanData.nik_pewaris,
        pengajuanData.alamat_pewaris,
        pengajuanData.nama_pemohon,
        pengajuanData.nik_pemohon,
        pengajuanData.alamat_pemohon,
        pengajuanData.no_hp,
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

  // Hapus pengajuan rekomendasi surat ahli waris
  static async deletePengajuan(idPengajuan, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        DELETE FROM rekomendasi_surat_ahli_waris
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

  // Ambil semua pengajuan rekomendasi surat ahli waris
  static async getAllPengajuan(idUser = null, paginationOptions = null) {
    try {
      const { whereClause, values } = buildPengajuanFilters({
        idUser,
        query: paginationOptions || {},
        keywordColumns: ['nama_pewaris', 'nama_pemohon', 'nik_pewaris', 'nik_pemohon', 'alamat_pewaris', 'alamat_pemohon']
      });

      if (paginationOptions) {
        const { page, limit, offset } = parsePagination(paginationOptions);
        const [countRows] = await db.execute(
          `SELECT COUNT(*) AS total FROM rekomendasi_surat_ahli_waris ${whereClause}`,
          values
        );

        const [rows] = await db.execute(
          `
            SELECT * FROM rekomendasi_surat_ahli_waris
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
        SELECT * FROM rekomendasi_surat_ahli_waris
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

  // Ambil pengajuan rekomendasi surat ahli waris berdasarkan ID
  static async getPengajuanById(idPengajuan, idUser = null) {
    try {
      const whereClause = idUser ? 'WHERE id_pengajuan = ? AND id_user = ?' : 'WHERE id_pengajuan = ?';

      const query = `
        SELECT * FROM rekomendasi_surat_ahli_waris
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
