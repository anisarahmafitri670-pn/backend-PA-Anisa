const db = require('../config/db');

const LAYANAN_CONFIG = {
  rekomendasi_penelitian: {
    table: 'rekomendasi_penelitian',
    dokumenTable: 'dokumen_rekomendasi_penelitian',
    label: 'Rekomendasi Penelitian',
    code: 'RP',
    namaField: 'nama_peneliti'
  },
  rekomendasi_surat_pindah: {
    table: 'rekomendasi_surat_pindah',
    dokumenTable: 'dokumen_rekomendasi_surat_pindah',
    label: 'Rekomendasi Surat Pindah',
    code: 'SP',
    namaField: 'nama_lengkap'
  },
  rekomendasi_akta_kelahiran: {
    table: 'rekomendasi_akta_kelahiran',
    dokumenTable: 'dokumen_rekomendasi_akta_kelahiran',
    label: 'Rekomendasi Akta Kelahiran',
    code: 'AK',
    namaField: 'nama_pemohon'
  },
  rekomendasi_kartu_keluarga: {
    table: 'rekomendasi_kartu_keluarga',
    dokumenTable: 'dokumen_rekomendasi_kartu_keluarga',
    label: 'Rekomendasi Kartu Keluarga',
    code: 'KK',
    namaField: 'nama_pemohon'
  },
  rekomendasi_surat_kerja: {
    table: 'rekomendasi_surat_kerja',
    dokumenTable: 'dokumen_rekomendasi_surat_kerja',
    label: 'Rekomendasi Kerja',
    code: 'RK',
    namaField: 'nama_pemohon'
  },
  rekomendasi_surat_tanah: {
    table: 'rekomendasi_surat_tanah',
    dokumenTable: 'dokumen_rekomendasi_surat_tanah',
    label: 'Rekomendasi Surat Tanah',
    code: 'ST',
    namaField: 'nama_pemohon'
  },
  rekomendasi_surat_ahli_waris: {
    table: 'rekomendasi_surat_ahli_waris',
    dokumenTable: 'dokumen_rekomendasi_surat_ahli_waris',
    label: 'Rekomendasi Surat Ahli Waris',
    code: 'AW',
    namaField: 'nama_pemohon'
  },
  rekomendasi_surat_yayasan: {
    table: 'rekomendasi_surat_yayasan',
    dokumenTable: 'dokumen_rekomendasi_surat_yayasan',
    label: 'Rekomendasi Surat Yayasan',
    code: 'SY',
    namaField: 'nama_pemohon'
  }
};

class KepalaCamatLaporanModel {
  static getLayananConfig() {
    return LAYANAN_CONFIG;
  }

  static async getAllPengajuan() {
    try {
      const entries = Object.entries(LAYANAN_CONFIG);
      const results = await Promise.all(
        entries.map(async ([layananKey, config]) => {
          try {
            const [rows] = await db.query(`SELECT * FROM ${config.table}`);
            return rows.map((row) => ({
              layanan: layananKey,
              config,
              row
            }));
          } catch (error) {
            throw new Error(`${config.table}: ${error.message}`);
          }
        })
      );

      return {
        success: true,
        data: results.flat()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getDetailByLayananAndId(layanan, idPengajuan) {
    try {
      const config = LAYANAN_CONFIG[layanan];
      if (!config) {
        return { success: true, data: null };
      }

      const [rows] = await db.execute(
        `
          SELECT *
          FROM ${config.table}
          WHERE id_pengajuan = ?
          LIMIT 1
        `,
        [idPengajuan]
      );

      if (!rows[0]) {
        return {
          success: true,
          data: null
        };
      }

      const [dokumenRows] = await db.execute(
        `
          SELECT id_dokumen, id_pengajuan, jenis_dokumen, file_path, original_name, mime_type, file_size, uploaded_at
          FROM ${config.dokumenTable}
          WHERE id_pengajuan = ?
          ORDER BY uploaded_at DESC
        `,
        [idPengajuan]
      );

      return {
        success: true,
        data: {
          layanan,
          config,
          row: rows[0],
          dokumen: dokumenRows
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = KepalaCamatLaporanModel;
