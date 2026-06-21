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

function padNomorPengajuan(idPengajuan) {
  return String(idPengajuan || 0).padStart(3, '0');
}

function formatTanggal(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toSortableTime(value) {
  const date = new Date(value || 0);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function buildNomorPengajuan(code, idPengajuan) {
  return `${code}-${padNomorPengajuan(idPengajuan)}`;
}

function resolveTanggalPengajuan(row) {
  return row.created_at || row.updated_at || row.tanggal_verifikasi || row.waktu_penelitian || null;
}

function pickValue(row, fields) {
  for (const field of fields) {
    if (row[field] !== undefined && row[field] !== null && String(row[field]).trim() !== '') {
      return row[field];
    }
  }

  return null;
}

function buildDataPemohon(item) {
  const row = item.row;

  return {
    nama_pemohon: pickValue(row, ['nama_pemohon', 'nama_lengkap', 'nama_peneliti']),
    nik: pickValue(row, ['nik', 'nik_pemohon']),
    no_hp: pickValue(row, ['no_hp']),
    alamat: pickValue(row, ['alamat', 'alamat_pemohon', 'alamat_asal']),
    email: pickValue(row, ['email']),
    instansi: pickValue(row, ['instansi']),
    nama_pewaris: pickValue(row, ['nama_pewaris']),
    nik_pewaris: pickValue(row, ['nik_pewaris']),
    alamat_pewaris: pickValue(row, ['alamat_pewaris'])
  };
}

function buildDataPengajuan(item) {
  const row = item.row;

  return {
    id_pengajuan: row.id_pengajuan,
    jenis_layanan: item.config.label,
    nomor_pengajuan: buildNomorPengajuan(item.config.code, row.id_pengajuan),
    tanggal_pengajuan: formatTanggal(resolveTanggalPengajuan(row)),
    keterangan: pickValue(row, ['keterangan']),
    alamat_asal: pickValue(row, ['alamat_asal']),
    alamat_pindah: pickValue(row, ['alamat_pindah']),
    topik_penelitian: pickValue(row, ['topik_penelitian']),
    lokasi_penelitian: pickValue(row, ['lokasi_penelitian']),
    waktu_penelitian: pickValue(row, ['waktu_penelitian']),
    jabatan: pickValue(row, ['jabatan']),
    nama_lembaga: pickValue(row, ['nama_lembaga']),
    alamat_lembaga: pickValue(row, ['alamat_lembaga'])
  };
}

function mapDokumen(item) {
  return {
    id_dokumen: item.id_dokumen,
    jenis_dokumen: item.jenis_dokumen,
    file_path: item.file_path,
    original_name: item.original_name,
    mime_type: item.mime_type,
    file_size: item.file_size,
    uploaded_at: item.uploaded_at
  };
}

function mapRowToNormalized(item) {
  const row = item.row;

  return {
    id_pengajuan: row.id_pengajuan,
    nomor_pengajuan: buildNomorPengajuan(item.config.code, row.id_pengajuan),
    nama_pemohon: pickValue(row, [item.config.namaField, 'nama_pemohon', 'nama_lengkap', 'nama_peneliti']),
    jenis_layanan: item.config.label,
    layanan: item.layanan,
    tanggal_pengajuan: formatTanggal(resolveTanggalPengajuan(row)),
    status: formatStatus(row.status),
    catatan_petugas: row.catatan_petugas || '',
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

    if (layanan) {
      const layananKey = String(item.layanan || '').trim().toLowerCase();
      const layananLabel = String(item.jenis_layanan || '').trim().toLowerCase();
      if (layananKey !== layanan && layananLabel !== layanan) {
        return false;
      }
    }

    if (!filterByTanggal(item, tanggalAwal, tanggalAkhir)) {
      return false;
    }

    if (keyword) {
      const haystack = [
        item.nomor_pengajuan,
        item.nama_pemohon,
        item.jenis_layanan
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

function sortByTanggalDesc(data, getValue = (item) => item.tanggal_pengajuan) {
  return [...data].sort((a, b) => toSortableTime(getValue(b)) - toSortableTime(getValue(a)));
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
          message: 'Gagal mengambil data laporan',
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

      return R.ok(res, 'Data laporan berhasil diambil', {
        total_pengajuan: filtered.length,
        rekap_status: rekapStatus,
        rekap_layanan: buildRekapLayanan(filtered),
        daftar_pengajuan: filtered
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data laporan',
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
          message: 'Gagal mengambil detail laporan',
          error: result.error || 'Internal Server Error'
        });
      }

      if (!result.data) {
        return R.notFound(res, 'Data pengajuan tidak ditemukan');
      }

      const normalized = mapRowToNormalized(result.data);

      return R.ok(res, 'Detail laporan berhasil diambil', {
        ...normalized,
        data_pemohon: buildDataPemohon(result.data),
        data_pengajuan: buildDataPengajuan(result.data),
        status: formatStatus(result.data.row.status),
        catatan_petugas: result.data.row.catatan_petugas || '',
        daftar_dokumen: (result.data.dokumen || []).map(mapDokumen),
        file_surat_hasil: result.data.row.file_surat_hasil || null,
        nama_file_surat_hasil: result.data.row.nama_file_surat_hasil || null,
        detail_pengajuan: result.data.row
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail laporan',
        error: error.message || 'Internal Server Error'
      });
    }
  }
}

module.exports = KepalaCamatController;
