const R = require('../utils/response');
const KepalaCamatLaporanModel = require('../models/kepalaCamatLaporanModel');

const STATUS_ORDER = ['menunggu_verifikasi', 'verifikasi', 'diproses', 'selesai', 'ditolak'];

function normalizeStatus(status) {
  const value = String(status || '').trim().toLowerCase();

  if (value === 'menunggu verifikasi' || value === 'menunggu_verifikasi' || value === '') {
    return 'menunggu_verifikasi';
  }

  if (value === 'verifikasi') {
    return 'verifikasi';
  }

  if (value === 'diproses') {
    return 'diproses';
  }

  if (value === 'selesai') {
    return 'selesai';
  }

  if (value === 'ditolak') {
    return 'ditolak';
  }

  return value.replace(/\s+/g, '_');
}

function formatStatus(status) {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case 'menunggu_verifikasi':
      return 'Menunggu Verifikasi';
    case 'verifikasi':
      return 'Verifikasi';
    case 'diproses':
      return 'Diproses';
    case 'selesai':
      return 'Selesai';
    case 'ditolak':
      return 'Ditolak';
    default:
      return String(status || 'Menunggu Verifikasi').trim() || 'Menunggu Verifikasi';
  }
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toISOString();
}

function buildNomorPengajuan(code, idPengajuan) {
  return `${code}-${idPengajuan}`;
}

function resolveTanggalPengajuan(row) {
  return row.created_at || row.updated_at || row.tanggal_verifikasi || row.waktu_penelitian || null;
}

function mapRowToNormalized(item) {
  const { layanan, config, row } = item;
  const namaPemohon = row[config.namaField] || row.nama_pemohon || row.nama_lengkap || row.nama_peneliti || null;

  return {
    id_pengajuan: row.id_pengajuan,
    nomor_pengajuan: buildNomorPengajuan(config.code, row.id_pengajuan),
    nama_pemohon: namaPemohon,
    jenis_layanan: config.label,
    layanan,
    tanggal_pengajuan: toIsoDate(resolveTanggalPengajuan(row)),
    status: formatStatus(row.status),
    catatan_petugas: row.catatan_petugas || null,
    file_surat_hasil: row.file_surat_hasil || null
  };
}

function createStatusCounter() {
  return {
    menunggu_verifikasi: 0,
    verifikasi: 0,
    diproses: 0,
    selesai: 0,
    ditolak: 0
  };
}

function buildRekapLayanan(normalizedData) {
  const grouped = new Map();

  normalizedData.forEach((item) => {
    const current = grouped.get(item.layanan) || {
      layanan: item.layanan,
      jenis_layanan: item.jenis_layanan,
      total_pengajuan: 0
    };

    current.total_pengajuan += 1;
    grouped.set(item.layanan, current);
  });

  return Array.from(grouped.values()).sort((a, b) => a.jenis_layanan.localeCompare(b.jenis_layanan));
}

function filterByTanggal(item, tanggalAwal, tanggalAkhir) {
  if (!tanggalAwal && !tanggalAkhir) {
    return true;
  }

  if (!item.tanggal_pengajuan) {
    return false;
  }

  const itemDate = new Date(item.tanggal_pengajuan);
  if (Number.isNaN(itemDate.getTime())) {
    return false;
  }

  if (tanggalAwal) {
    const startDate = new Date(`${tanggalAwal}T00:00:00`);
    if (Number.isNaN(startDate.getTime()) || itemDate < startDate) {
      return false;
    }
  }

  if (tanggalAkhir) {
    const endDate = new Date(`${tanggalAkhir}T23:59:59.999`);
    if (Number.isNaN(endDate.getTime()) || itemDate > endDate) {
      return false;
    }
  }

  return true;
}

function filterPengajuan(data, query) {
  const status = query.status ? normalizeStatus(query.status) : '';
  const layanan = String(query.layanan || '').trim().toLowerCase();
  const keyword = String(query.keyword || '').trim().toLowerCase();
  const tanggalAwal = String(query.tanggal_awal || '').trim();
  const tanggalAkhir = String(query.tanggal_akhir || '').trim();

  return data.filter((item) => {
    if (status && normalizeStatus(item.status) !== status) {
      return false;
    }

    if (layanan && item.layanan !== layanan) {
      return false;
    }

    if (!filterByTanggal(item, tanggalAwal, tanggalAkhir)) {
      return false;
    }

    if (keyword) {
      const haystack = [
        item.nomor_pengajuan,
        item.nama_pemohon,
        item.jenis_layanan,
        item.status,
        item.catatan_petugas
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(keyword)) {
        return false;
      }
    }

    return true;
  });
}

function sortByTanggalDesc(data) {
  return [...data].sort((a, b) => {
    const left = new Date(a.tanggal_pengajuan || 0).getTime();
    const right = new Date(b.tanggal_pengajuan || 0).getTime();
    return right - left;
  });
}

class KepalaCamatController {
  static async dashboard(req, res) {
    try {
      const result = await KepalaCamatLaporanModel.getAllPengajuan();
      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengambil data dashboard kepala camat',
          error: result.error || 'Internal Server Error'
        });
      }

      const normalized = result.data.map(mapRowToNormalized);
      const sorted = sortByTanggalDesc(normalized);
      const statusCounter = createStatusCounter();

      normalized.forEach((item) => {
        const key = normalizeStatus(item.status);
        if (STATUS_ORDER.includes(key)) {
          statusCounter[key] += 1;
        }
      });

      return R.ok(res, 'Data dashboard kepala camat berhasil diambil', {
        total_pengajuan: normalized.length,
        menunggu_verifikasi: statusCounter.menunggu_verifikasi,
        verifikasi: statusCounter.verifikasi,
        diproses: statusCounter.diproses,
        selesai: statusCounter.selesai,
        ditolak: statusCounter.ditolak,
        rekap_layanan: buildRekapLayanan(normalized),
        pengajuan_terbaru: sorted.slice(0, 10)
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data dashboard kepala camat',
        error: error.message || 'Internal Server Error'
      });
    }
  }

  static async laporan(req, res) {
    try {
      const result = await KepalaCamatLaporanModel.getAllPengajuan();
      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengambil data laporan kepala camat',
          error: result.error || 'Internal Server Error'
        });
      }

      const normalized = result.data.map(mapRowToNormalized);
      const filtered = sortByTanggalDesc(filterPengajuan(normalized, req.query));
      const rekapStatus = createStatusCounter();

      filtered.forEach((item) => {
        const key = normalizeStatus(item.status);
        if (STATUS_ORDER.includes(key)) {
          rekapStatus[key] += 1;
        }
      });

      return R.ok(res, 'Data laporan kepala camat berhasil diambil', {
        total_pengajuan: filtered.length,
        rekap_status: rekapStatus,
        rekap_layanan: buildRekapLayanan(filtered),
        daftar_pengajuan: filtered
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data laporan kepala camat',
        error: error.message || 'Internal Server Error'
      });
    }
  }

  static async detailLaporan(req, res) {
    try {
      const layanan = String(req.params.layanan || '').trim().toLowerCase();
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID pengajuan tidak valid');
      }

      const result = await KepalaCamatLaporanModel.getDetailByLayananAndId(layanan, id);
      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengambil detail laporan kepala camat',
          error: result.error || 'Internal Server Error'
        });
      }

      if (!result.data) {
        return R.notFound(res, 'Data pengajuan tidak ditemukan');
      }

      const normalized = mapRowToNormalized(result.data);

      return R.ok(res, 'Detail laporan kepala camat berhasil diambil', {
        ...normalized,
        detail_pengajuan: result.data.row
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail laporan kepala camat',
        error: error.message || 'Internal Server Error'
      });
    }
  }
}

module.exports = KepalaCamatController;
