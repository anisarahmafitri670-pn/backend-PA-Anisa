jest.mock('../models/rekomendasiPenelitianModel', () => ({
  getAllRekomendasi: jest.fn()
}));

jest.mock('../models/rekomendasiSuratPindahModel', () => ({
  getAllPengajuan: jest.fn()
}));

jest.mock('../models/rekomendasiAktaKelahiranModel', () => ({
  getAllPengajuan: jest.fn()
}));

jest.mock('../models/rekomendasiKartuKeluargaModel', () => ({
  getAllPengajuan: jest.fn()
}));

jest.mock('../models/rekomendasiSuratKerjaModel', () => ({
  getAllPengajuan: jest.fn()
}));

jest.mock('../models/rekomendasiSuratTanahModel', () => ({
  getAllPengajuan: jest.fn()
}));

jest.mock('../models/rekomendasiSuratAhliWarisModel', () => ({
  getAllPengajuan: jest.fn()
}));

jest.mock('../models/rekomendasiSuratYayasanModel', () => ({
  getAllPengajuan: jest.fn()
}));

const RekomendasiPenelitianController = require('../controllers/rekomendasiPenelitianController');
const RekomendasiSuratPindahController = require('../controllers/rekomendasiSuratPindahController');
const RekomendasiAktaKelahiranController = require('../controllers/rekomendasiAktaKelahiranController');
const RekomendasiKartuKeluargaController = require('../controllers/rekomendasiKartuKeluargaController');
const RekomendasiSuratKerjaController = require('../controllers/rekomendasiSuratKerjaController');
const RekomendasiSuratTanahController = require('../controllers/rekomendasiSuratTanahController');
const RekomendasiSuratAhliWarisController = require('../controllers/rekomendasiSuratAhliWarisController');
const RekomendasiSuratYayasanController = require('../controllers/rekomendasiSuratYayasanController');

const RekomendasiPenelitianModel = require('../models/rekomendasiPenelitianModel');
const RekomendasiSuratPindahModel = require('../models/rekomendasiSuratPindahModel');
const RekomendasiAktaKelahiranModel = require('../models/rekomendasiAktaKelahiranModel');
const RekomendasiKartuKeluargaModel = require('../models/rekomendasiKartuKeluargaModel');
const RekomendasiSuratKerjaModel = require('../models/rekomendasiSuratKerjaModel');
const RekomendasiSuratTanahModel = require('../models/rekomendasiSuratTanahModel');
const RekomendasiSuratAhliWarisModel = require('../models/rekomendasiSuratAhliWarisModel');
const RekomendasiSuratYayasanModel = require('../models/rekomendasiSuratYayasanModel');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function createReq(userId = 17) {
  return {
    user: {
      id_user: userId,
      role: 'masyarakat'
    },
    query: {
      page: '1',
      limit: '10'
    }
  };
}

const pagination = {
  current_page: 1,
  per_page: 10,
  total_data: 1,
  total_page: 1,
  from: 1,
  to: 1,
  has_next: false,
  has_prev: false
};

const layananList = [
  {
    endpoint: 'GET /api/rekomendasi_penelitian',
    jenisLayanan: 'Rekomendasi Penelitian',
    controller: RekomendasiPenelitianController,
    controllerMethod: 'getAllRekomendasi',
    model: RekomendasiPenelitianModel,
    modelMethod: 'getAllRekomendasi',
    prefix: 'RP'
  },
  {
    endpoint: 'GET /api/rekomendasi_surat_pindah',
    jenisLayanan: 'Rekomendasi Surat Pindah',
    controller: RekomendasiSuratPindahController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiSuratPindahModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'SP'
  },
  {
    endpoint: 'GET /api/rekomendasi_akta_kelahiran',
    jenisLayanan: 'Rekomendasi Akta Kelahiran',
    controller: RekomendasiAktaKelahiranController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiAktaKelahiranModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'AK'
  },
  {
    endpoint: 'GET /api/rekomendasi_kartu_keluarga',
    jenisLayanan: 'Rekomendasi Kartu Keluarga',
    controller: RekomendasiKartuKeluargaController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiKartuKeluargaModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'KK'
  },
  {
    endpoint: 'GET /api/rekomendasi_surat_kerja',
    jenisLayanan: 'Rekomendasi Kerja',
    controller: RekomendasiSuratKerjaController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiSuratKerjaModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'RK'
  },
  {
    endpoint: 'GET /api/rekomendasi_surat_tanah',
    jenisLayanan: 'Rekomendasi Surat Tanah',
    controller: RekomendasiSuratTanahController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiSuratTanahModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'ST'
  },
  {
    endpoint: 'GET /api/rekomendasi_surat_ahli_waris',
    jenisLayanan: 'Rekomendasi Surat Ahli Waris',
    controller: RekomendasiSuratAhliWarisController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiSuratAhliWarisModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'AW'
  },
  {
    endpoint: 'GET /api/rekomendasi_surat_yayasan',
    jenisLayanan: 'Rekomendasi Surat Yayasan',
    controller: RekomendasiSuratYayasanController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiSuratYayasanModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'SY'
  }
];

describe('Iterasi 6 - History Pengajuan Masyarakat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(layananList)('$endpoint berhasil menampilkan riwayat pengajuan milik user', async (layanan) => {
    const req = createReq(17);
    const res = createResMock();
    const historyItem = {
      id_pengajuan: 21,
      id_user: 17,
      jenis_layanan: layanan.jenisLayanan,
      status: 'Menunggu Verifikasi',
      tanggal_pengajuan: '2026-07-07 09:00:00',
      updated_at: '2026-07-07 09:00:00'
    };

    layanan.model[layanan.modelMethod].mockResolvedValue({
      success: true,
      data: [historyItem],
      pagination
    });

    await layanan.controller[layanan.controllerMethod](req, res);

    expect(layanan.model[layanan.modelMethod]).toHaveBeenCalledWith(17, req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: [
          expect.objectContaining({
            id_pengajuan: 21,
            id_user: 17,
            nomor_pengajuan: `${layanan.prefix}-021`,
            jenis_layanan: layanan.jenisLayanan,
            status: 'Menunggu Verifikasi',
            tanggal_pengajuan: '2026-07-07 09:00:00'
          })
        ],
        pagination
      })
    );
  });

  test.each(layananList)('$endpoint tetap berhasil dengan data kosong jika user belum memiliki pengajuan', async (layanan) => {
    const req = createReq(17);
    const res = createResMock();
    const emptyPagination = {
      current_page: 1,
      per_page: 10,
      total_data: 0,
      total_page: 0,
      from: 0,
      to: 0,
      has_next: false,
      has_prev: false
    };

    layanan.model[layanan.modelMethod].mockResolvedValue({
      success: true,
      data: [],
      pagination: emptyPagination
    });

    await layanan.controller[layanan.controllerMethod](req, res);

    expect(layanan.model[layanan.modelMethod]).toHaveBeenCalledWith(17, req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: [],
        pagination: emptyPagination
      })
    );
  });

  test.each(layananList)('$endpoint tidak menampilkan riwayat milik user lain', async (layanan) => {
    const req = createReq(17);
    const res = createResMock();

    layanan.model[layanan.modelMethod].mockResolvedValue({
      success: true,
      data: [
        {
          id_pengajuan: 8,
          id_user: 17,
          jenis_layanan: layanan.jenisLayanan,
          status: 'Diproses',
          tanggal_pengajuan: '2026-07-06 08:00:00'
        }
      ],
      pagination
    });

    await layanan.controller[layanan.controllerMethod](req, res);

    expect(layanan.model[layanan.modelMethod]).toHaveBeenCalledWith(17, req.query);
    const payload = res.json.mock.calls[0][0];
    expect(payload.data.every((item) => item.id_user === 17)).toBe(true);
  });

  test.each(layananList)('$endpoint menampilkan status terbaru sesuai perubahan terakhir', async (layanan) => {
    const req = createReq(17);
    const res = createResMock();

    layanan.model[layanan.modelMethod].mockResolvedValue({
      success: true,
      data: [
        {
          id_pengajuan: 31,
          id_user: 17,
          jenis_layanan: layanan.jenisLayanan,
          status: 'Selesai',
          tanggal_pengajuan: '2026-07-05 10:00:00',
          updated_at: '2026-07-07 14:30:00'
        }
      ],
      pagination
    });

    await layanan.controller[layanan.controllerMethod](req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data[0]).toEqual(
      expect.objectContaining({
        id_pengajuan: 31,
        status: 'Selesai',
        updated_at: '2026-07-07 14:30:00'
      })
    );
  });
});
