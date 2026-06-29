const PREFIX_BY_LAYANAN = {
  rekomendasi_penelitian: 'RP',
  rekomendasi_surat_pindah: 'SP',
  rekomendasi_akta_kelahiran: 'AK',
  rekomendasi_kartu_keluarga: 'KK',
  rekomendasi_surat_kerja: 'RK',
  rekomendasi_surat_tanah: 'ST',
  rekomendasi_surat_ahli_waris: 'AW',
  rekomendasi_surat_yayasan: 'SY'
};

function padNomorPengajuan(idPengajuan) {
  return String(idPengajuan || 0).padStart(3, '0');
}

function buildNomorPengajuan(prefix, idPengajuan) {
  return `${prefix}-${padNomorPengajuan(idPengajuan)}`;
}

function ensureNomorPengajuan(item, prefix) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  if (item.nomor_pengajuan) {
    return item;
  }

  return {
    ...item,
    nomor_pengajuan: buildNomorPengajuan(prefix, item.id_pengajuan)
  };
}

function addNomorPengajuanToList(items, prefix) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ensureNomorPengajuan(item, prefix));
}

module.exports = {
  PREFIX_BY_LAYANAN,
  buildNomorPengajuan,
  ensureNomorPengajuan,
  addNomorPengajuanToList
};
