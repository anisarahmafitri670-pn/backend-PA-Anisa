const path = require('path');

const LAYANAN = {
  rekomendasi_penelitian: {
    table: 'rekomendasi_penelitian',
    prefix: 'RP',
    label: 'Rekomendasi Penelitian'
  },
  rekomendasi_surat_pindah: {
    table: 'rekomendasi_surat_pindah',
    prefix: 'SP',
    label: 'Rekomendasi Surat Pindah'
  },
  rekomendasi_akta_kelahiran: {
    table: 'rekomendasi_akta_kelahiran',
    prefix: 'AK',
    label: 'Rekomendasi Akta Kelahiran'
  },
  rekomendasi_kartu_keluarga: {
    table: 'rekomendasi_kartu_keluarga',
    prefix: 'KK',
    label: 'Rekomendasi Kartu Keluarga'
  },
  rekomendasi_surat_kerja: {
    table: 'rekomendasi_surat_kerja',
    prefix: 'RK',
    label: 'Rekomendasi Kerja'
  },
  rekomendasi_surat_tanah: {
    table: 'rekomendasi_surat_tanah',
    prefix: 'ST',
    label: 'Rekomendasi Surat Tanah'
  },
  rekomendasi_surat_ahli_waris: {
    table: 'rekomendasi_surat_ahli_waris',
    prefix: 'AW',
    label: 'Rekomendasi Surat Ahli Waris'
  },
  rekomendasi_surat_yayasan: {
    table: 'rekomendasi_surat_yayasan',
    prefix: 'SY',
    label: 'Rekomendasi Yayasan/TPQ/Ormas'
  }
};

const DEFAULT_COLUMNS = {
  primaryKey: 'id_pengajuan',
  statusColumn: 'status',
  catatanColumn: 'catatan_petugas',
  tanggalVerifikasiColumn: 'tanggal_verifikasi',
  fileSuratHasilColumn: 'file_surat_hasil',
  namaFileSuratHasilColumn: 'nama_file_surat_hasil',
  uploadedSuratHasilAtColumn: 'uploaded_surat_hasil_at'
};

const STATUS_MAP = {
  'menunggu verifikasi': 'Menunggu Verifikasi',
  menunggu_verifikasi: 'Menunggu Verifikasi',
  verifikasi: 'Verifikasi',
  diproses: 'Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak'
};

function getLayananConfig(layanan) {
  const config = LAYANAN[String(layanan || '').trim()];
  return config ? { ...DEFAULT_COLUMNS, ...config } : null;
}

function getAllLayanan() {
  return Object.keys(LAYANAN);
}

function normalizeStatus(status) {
  const key = String(status || '').trim().toLowerCase();
  return STATUS_MAP[key] || null;
}

function buildNomorPengajuan(config, idPengajuan) {
  return `${config.prefix}-${String(idPengajuan || 0).padStart(3, '0')}`;
}

function buildBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function buildSuratHasilUrl(req, filePath) {
  if (!filePath) {
    return null;
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  return `${buildBaseUrl(req)}${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
}

function normalizePengajuanRow(req, layanan, row) {
  if (!row) {
    return null;
  }

  const config = getLayananConfig(layanan);
  const status = normalizeStatus(row.status) || row.status || 'Menunggu Verifikasi';

  return {
    ...row,
    layanan,
    nomor_pengajuan: config ? buildNomorPengajuan(config, row.id_pengajuan) : row.nomor_pengajuan,
    jenis_layanan: config ? config.label : row.jenis_layanan,
    status_pengajuan: status,
    status,
    file_surat_hasil: row.file_surat_hasil || null,
    nama_file_surat_hasil: row.nama_file_surat_hasil || null,
    surat_hasil_url: buildSuratHasilUrl(req, row.file_surat_hasil || null)
  };
}

function safeUploadPath(filePath) {
  if (!filePath || /^https?:\/\//i.test(filePath)) {
    return null;
  }

  const normalized = String(filePath).replace(/^\/+/, '');
  if (!normalized.startsWith('uploads/')) {
    return null;
  }

  return path.join(process.cwd(), normalized);
}

module.exports = {
  LAYANAN,
  getLayananConfig,
  getAllLayanan,
  normalizeStatus,
  normalizePengajuanRow,
  buildSuratHasilUrl,
  safeUploadPath
};
