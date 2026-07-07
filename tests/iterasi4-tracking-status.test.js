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
    nama: 'rekomendasi penelitian',
    endpoint: 'GET /api/rekomendasi_penelitian',
    controller: RekomendasiPenelitianController,
    controllerMethod: 'getAllRekomendasi',
    model: RekomendasiPenelitianModel,
    modelMethod: 'getAllRekomendasi',
    prefix: 'RP',
    namaField: 'nama_peneliti'
  },
  {
    nama: 'rekomendasi surat pindah',
    endpoint: 'GET /api/rekomendasi_surat_pindah',
    controller: RekomendasiSuratPindahController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiSuratPindahModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'SP',
    namaField: 'nama_lengkap'
  },
  {
    nama: 'rekomendasi akta kelahiran',
    endpoint: 'GET /api/rekomendasi_akta_kelahiran',
    controller: RekomendasiAktaKelahiranController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiAktaKelahiranModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'AK',
    namaField: 'nama_pemohon'
  },
  {
    nama: 'rekomendasi kartu keluarga',
    endpoint: 'GET /api/rekomendasi_kartu_keluarga',
    controller: RekomendasiKartuKeluargaController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiKartuKeluargaModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'KK',
    namaField: 'nama_pemohon'
  },
  {
    nama: 'rekomendasi surat kerja',
    endpoint: 'GET /api/rekomendasi_surat_kerja',
    controller: RekomendasiSuratKerjaController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiSuratKerjaModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'RK',
    namaField: 'nama_pemohon'
  },
  {
    nama: 'rekomendasi surat tanah',
    endpoint: 'GET /api/rekomendasi_surat_tanah',
    controller: RekomendasiSuratTanahController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiSuratTanahModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'ST',
    namaField: 'nama_pemohon'
  },
  {
    nama: 'rekomendasi surat ahli waris',
    endpoint: 'GET /api/rekomendasi_surat_ahli_waris',
    controller: RekomendasiSuratAhliWarisController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiSuratAhliWarisModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'AW',
    namaField: 'nama_pemohon'
  },
  {
    nama: 'rekomendasi surat yayasan',
    endpoint: 'GET /api/rekomendasi_surat_yayasan',
    controller: RekomendasiSuratYayasanController,
    controllerMethod: 'getAllPengajuan',
    model: RekomendasiSuratYayasanModel,
    modelMethod: 'getAllPengajuan',
    prefix: 'SY',
    namaField: 'nama_pemohon'
  }
];

describe('Iterasi 4 - Tracking Status Pengajuan Masyarakat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(layananList)('$endpoint berhasil mengembalikan daftar pengajuan milik user dengan status terbaru', async (layanan) => {
    const req = createReq(17);
    const res = createResMock();
    const dataTerbaru = {
      id_pengajuan: 12,
      id_user: 17,
      [layanan.namaField]: 'Anisa Rahma',
      status: 'Diproses',
      created_at: '2026-07-07 10:00:00',
      updated_at: '2026-07-07 11:00:00'
    };

    layanan.model[layanan.modelMethod].mockResolvedValue({
      success: true,
      data: [dataTerbaru],
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
            id_pengajuan: 12,
            id_user: 17,
            nomor_pengajuan: `${layanan.prefix}-012`,
            status: 'Diproses'
          })
        ],
        pagination
      })
    );
  });

  test.each(layananList)('$endpoint tetap berhasil saat user tidak memiliki pengajuan', async (layanan) => {
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

  test.each(layananList)('$endpoint tidak membuka data user lain karena model dipanggil memakai id_user token', async (layanan) => {
    const req = createReq(17);
    const res = createResMock();

    layanan.model[layanan.modelMethod].mockResolvedValue({
      success: true,
      data: [
        {
          id_pengajuan: 3,
          id_user: 17,
          [layanan.namaField]: 'Pemilik Token',
          status: 'Selesai'
        }
      ],
      pagination
    });

    await layanan.controller[layanan.controllerMethod](req, res);

    expect(layanan.model[layanan.modelMethod]).toHaveBeenCalledWith(17, req.query);
    const payload = res.json.mock.calls[0][0];
    expect(payload.data).toHaveLength(1);
    expect(payload.data[0]).toEqual(expect.objectContaining({ id_user: 17 }));
    expect(payload.data.every((item) => item.id_user === 17)).toBe(true);
  });
});
