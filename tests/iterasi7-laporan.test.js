jest.mock('../models/kepalaCamatLaporanModel', () => ({
  getAllPengajuan: jest.fn()
}));

const KepalaCamatController = require('../controllers/kepalaCamatController');
const KepalaCamatLaporanModel = require('../models/kepalaCamatLaporanModel');
const authorizeRoles = require('../middleware/role');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function createReq(query = {}, role = 'kepala camat') {
  return {
    user: {
      id_user: 3,
      role
    },
    query
  };
}

const layananConfigs = [
  {
    layanan: 'rekomendasi_penelitian',
    label: 'Rekomendasi Penelitian',
    code: 'RP',
    namaField: 'nama_peneliti',
    namaValue: 'Anisa Peneliti'
  },
  {
    layanan: 'rekomendasi_surat_pindah',
    label: 'Rekomendasi Surat Pindah',
    code: 'SP',
    namaField: 'nama_lengkap',
    namaValue: 'Anisa Pindah'
  },
  {
    layanan: 'rekomendasi_akta_kelahiran',
    label: 'Rekomendasi Akta Kelahiran',
    code: 'AK',
    namaField: 'nama_pemohon',
    namaValue: 'Anisa Akta'
  },
  {
    layanan: 'rekomendasi_kartu_keluarga',
    label: 'Rekomendasi Kartu Keluarga',
    code: 'KK',
    namaField: 'nama_pemohon',
    namaValue: 'Anisa KK'
  },
  {
    layanan: 'rekomendasi_surat_kerja',
    label: 'Rekomendasi Kerja',
    code: 'RK',
    namaField: 'nama_pemohon',
    namaValue: 'Anisa Kerja'
  },
  {
    layanan: 'rekomendasi_surat_tanah',
    label: 'Rekomendasi Surat Tanah',
    code: 'ST',
    namaField: 'nama_pemohon',
    namaValue: 'Anisa Tanah'
  },
  {
    layanan: 'rekomendasi_surat_ahli_waris',
    label: 'Rekomendasi Surat Ahli Waris',
    code: 'AW',
    namaField: 'nama_pemohon',
    namaValue: 'Anisa Waris'
  },
  {
    layanan: 'rekomendasi_surat_yayasan',
    label: 'Rekomendasi Surat Yayasan',
    code: 'SY',
    namaField: 'nama_pemohon',
    namaValue: 'Anisa Yayasan'
  }
];

function createRawPengajuan(config, index) {
  const statuses = [
    'Menunggu Verifikasi',
    'Verifikasi',
    'Diproses',
    'Selesai',
    'Ditolak',
    'Menunggu Verifikasi',
    'Diproses',
    'Selesai'
  ];

  return {
    layanan: config.layanan,
    config: {
      label: config.label,
      code: config.code,
      namaField: config.namaField
    },
    row: {
      id_pengajuan: index + 1,
      [config.namaField]: config.namaValue,
      status: statuses[index],
      created_at: `2026-07-${String(index + 1).padStart(2, '0')}T08:00:00.000Z`,
      updated_at: `2026-07-${String(index + 1).padStart(2, '0')}T09:00:00.000Z`,
      catatan_petugas: index === 2 ? 'Dokumen sedang diproses' : null,
      file_surat_hasil: index === 3 ? '/uploads/surat-hasil/hasil.pdf' : null
    }
  };
}

function createAllPengajuan() {
  return layananConfigs.map((config, index) => createRawPengajuan(config, index));
}

describe('Iterasi 7 - Laporan dan Rekapitulasi Pengajuan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('kepala camat berhasil melihat seluruh laporan pengajuan', async () => {
    KepalaCamatLaporanModel.getAllPengajuan.mockResolvedValue({
      success: true,
      data: createAllPengajuan()
    });

    const req = createReq({ page: '1', limit: '10' });
    const res = createResMock();

    await KepalaCamatController.laporan(req, res);

    expect(KepalaCamatLaporanModel.getAllPengajuan).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Data laporan berhasil diambil',
        data: expect.objectContaining({
          total_pengajuan: 8,
          daftar_pengajuan: expect.any(Array),
          rekap_status: expect.objectContaining({
            menunggu_verifikasi: 2,
            verifikasi: 1,
            diproses: 2,
            selesai: 2,
            ditolak: 1
          }),
          rekap_layanan: expect.any(Array)
        }),
        pagination: expect.objectContaining({
          current_page: 1,
          total_data: 8
        })
      })
    );
  });

  test('response laporan berisi field penting', async () => {
    KepalaCamatLaporanModel.getAllPengajuan.mockResolvedValue({
      success: true,
      data: [createRawPengajuan(layananConfigs[4], 4)]
    });

    const req = createReq();
    const res = createResMock();

    await KepalaCamatController.laporan(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.daftar_pengajuan[0]).toEqual(
      expect.objectContaining({
        id_pengajuan: 5,
        nomor_pengajuan: 'RK-005',
        nama_pemohon: 'Anisa Kerja',
        jenis_layanan: 'Rekomendasi Kerja',
        status: 'Ditolak',
        tanggal_pengajuan: '2026-07-05'
      })
    );
  });

  test('filter laporan berdasarkan status berhasil', async () => {
    KepalaCamatLaporanModel.getAllPengajuan.mockResolvedValue({
      success: true,
      data: createAllPengajuan()
    });

    const req = createReq({ status: 'diproses' });
    const res = createResMock();

    await KepalaCamatController.laporan(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.total_pengajuan).toBe(2);
    expect(payload.data.daftar_pengajuan.every((item) => item.status === 'Diproses')).toBe(true);
  });

  test('filter laporan berdasarkan periode tanggal berhasil', async () => {
    KepalaCamatLaporanModel.getAllPengajuan.mockResolvedValue({
      success: true,
      data: createAllPengajuan()
    });

    const req = createReq({
      tanggal_awal: '2026-07-02',
      tanggal_akhir: '2026-07-04'
    });
    const res = createResMock();

    await KepalaCamatController.laporan(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.total_pengajuan).toBe(3);
    expect(payload.data.daftar_pengajuan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tanggal_pengajuan: '2026-07-02' }),
        expect.objectContaining({ tanggal_pengajuan: '2026-07-03' }),
        expect.objectContaining({ tanggal_pengajuan: '2026-07-04' })
      ])
    );
  });

  test.each(layananConfigs)('filter laporan berdasarkan jenis_layanan berhasil untuk $label', async (config) => {
    KepalaCamatLaporanModel.getAllPengajuan.mockResolvedValue({
      success: true,
      data: createAllPengajuan()
    });

    const req = createReq({ layanan: config.layanan });
    const res = createResMock();

    await KepalaCamatController.laporan(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.total_pengajuan).toBe(1);
    expect(payload.data.daftar_pengajuan[0]).toEqual(
      expect.objectContaining({
        jenis_layanan: config.label,
        layanan: config.layanan
      })
    );
  });

  test('filter tidak menemukan data tetap berhasil dengan data kosong', async () => {
    KepalaCamatLaporanModel.getAllPengajuan.mockResolvedValue({
      success: true,
      data: createAllPengajuan()
    });

    const req = createReq({ keyword: 'data yang tidak ada' });
    const res = createResMock();

    await KepalaCamatController.laporan(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          total_pengajuan: 0,
          daftar_pengajuan: []
        }),
        pagination: expect.objectContaining({
          total_data: 0,
          from: 0,
          to: 0
        })
      })
    );
  });

  test('user tanpa role kepala camat tidak dapat mengakses laporan', () => {
    const req = createReq({}, 'masyarakat');
    const res = createResMock();
    const next = jest.fn();
    const middleware = authorizeRoles('kepala camat');

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Forbidden'
    });
  });
});
