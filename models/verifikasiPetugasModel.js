const db = require('../config/db');

const TABLES = {
  rekomendasi_penelitian: 'rekomendasi_penelitian',
  rekomendasi_surat_pindah: 'rekomendasi_surat_pindah',
  rekomendasi_akta_kelahiran: 'rekomendasi_akta_kelahiran',
  rekomendasi_kartu_keluarga: 'rekomendasi_kartu_keluarga',
  rekomendasi_surat_kerja: 'rekomendasi_surat_kerja',
  rekomendasi_surat_tanah: 'rekomendasi_surat_tanah',
  rekomendasi_surat_ahli_waris: 'rekomendasi_surat_ahli_waris',
  rekomendasi_surat_yayasan: 'rekomendasi_surat_yayasan'
};

function getTableName(layanan) {
  return TABLES[layanan] || null;
}

class VerifikasiPetugasModel {
  static async findById(layanan, idPengajuan) {
    try {
      const tableName = getTableName(layanan);
      if (!tableName) {
        return { success: false, error: 'Layanan tidak valid' };
      }

      const query = `
        SELECT id_pengajuan, status, file_surat_hasil, nama_file_surat_hasil
        FROM ${tableName}
        WHERE id_pengajuan = ?
        LIMIT 1
      `;
      const [rows] = await db.execute(query, [idPengajuan]);
      return { success: true, data: rows[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async verifikasi(layanan, idPengajuan) {
    try {
      const tableName = getTableName(layanan);
      if (!tableName) {
        return { success: false, error: 'Layanan tidak valid' };
      }

      const query = `
        UPDATE ${tableName}
        SET status = ?, tanggal_verifikasi = NOW()
        WHERE id_pengajuan = ?
      `;
      const [result] = await db.execute(query, ['Verifikasi', idPengajuan]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async diproses(layanan, idPengajuan, catatanPetugas) {
    try {
      const tableName = getTableName(layanan);
      if (!tableName) {
        return { success: false, error: 'Layanan tidak valid' };
      }

      const query = `
        UPDATE ${tableName}
        SET status = ?, catatan_petugas = ?
        WHERE id_pengajuan = ?
      `;
      const [result] = await db.execute(query, ['Diproses', catatanPetugas || null, idPengajuan]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async ditolak(layanan, idPengajuan, catatanPetugas) {
    try {
      const tableName = getTableName(layanan);
      if (!tableName) {
        return { success: false, error: 'Layanan tidak valid' };
      }

      const query = `
        UPDATE ${tableName}
        SET status = ?, catatan_petugas = ?
        WHERE id_pengajuan = ?
      `;
      const [result] = await db.execute(query, ['Ditolak', catatanPetugas, idPengajuan]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async uploadSuratHasil(layanan, idPengajuan, filePath, originalName) {
    try {
      const tableName = getTableName(layanan);
      if (!tableName) {
        return { success: false, error: 'Layanan tidak valid' };
      }

      const query = `
        UPDATE ${tableName}
        SET file_surat_hasil = ?, nama_file_surat_hasil = ?
        WHERE id_pengajuan = ?
      `;
      const [result] = await db.execute(query, [filePath, originalName, idPengajuan]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async selesai(layanan, idPengajuan) {
    try {
      const tableName = getTableName(layanan);
      if (!tableName) {
        return { success: false, error: 'Layanan tidak valid' };
      }

      const query = `
        UPDATE ${tableName}
        SET status = ?
        WHERE id_pengajuan = ?
      `;
      const [result] = await db.execute(query, ['Selesai', idPengajuan]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = VerifikasiPetugasModel;
