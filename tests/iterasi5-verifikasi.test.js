jest.mock('../models/verifikasiPetugasModel', () => ({
  verifikasi: jest.fn(),
  diproses: jest.fn(),
  ditolak: jest.fn(),
  uploadSuratHasil: jest.fn(),
  selesai: jest.fn()
}));

const VerifikasiPetugasController = require('../controllers/verifikasiPetugasController');
const VerifikasiPetugasModel = require('../models/verifikasiPetugasModel');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function createReq(overrides = {}) {
  return {
    layanan: 'rekomendasi_surat_kerja',
    params: { id: '40' },
    body: {},
    file: null,
    user: {
      id_user: 2,
      role: 'petugas'
    },
    ...overrides
  };
}

describe('Iterasi 5 - Verifikasi Pengajuan Petugas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('petugas berhasil mengubah status pengajuan menjadi diverifikasi', async () => {
    VerifikasiPetugasModel.verifikasi.mockResolvedValue({
      success: true,
      affectedRows: 1
    });

    const req = createReq();
    const res = createResMock();

    await VerifikasiPetugasController.verifikasi(req, res);

    expect(VerifikasiPetugasModel.verifikasi).toHaveBeenCalledWith('rekomendasi_surat_kerja', 40);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Pengajuan berhasil diverifikasi',
      data: null
    });
  });

  test('petugas berhasil mengubah status pengajuan menjadi diproses', async () => {
    VerifikasiPetugasModel.diproses.mockResolvedValue({
      success: true,
      affectedRows: 1
    });

    const req = createReq({
      body: {
        catatan_petugas: 'Dokumen sedang diproses'
      }
    });
    const res = createResMock();

    await VerifikasiPetugasController.diproses(req, res);

    expect(VerifikasiPetugasModel.diproses).toHaveBeenCalledWith(
      'rekomendasi_surat_kerja',
      40,
      'Dokumen sedang diproses'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Pengajuan sedang diproses',
      data: null
    });
  });

  test('petugas berhasil mengubah status pengajuan menjadi ditolak', async () => {
    VerifikasiPetugasModel.ditolak.mockResolvedValue({
      success: true,
      affectedRows: 1
    });

    const req = createReq({
      body: {
        catatan_petugas: 'Dokumen tidak lengkap'
      }
    });
    const res = createResMock();

    await VerifikasiPetugasController.ditolak(req, res);

    expect(VerifikasiPetugasModel.ditolak).toHaveBeenCalledWith(
      'rekomendasi_surat_kerja',
      40,
      'Dokumen tidak lengkap'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Pengajuan ditolak',
      data: null
    });
  });

  test('petugas berhasil mengubah status pengajuan menjadi selesai', async () => {
    VerifikasiPetugasModel.selesai.mockResolvedValue({
      success: true,
      affectedRows: 1
    });

    const req = createReq();
    const res = createResMock();

    await VerifikasiPetugasController.selesai(req, res);

    expect(VerifikasiPetugasModel.selesai).toHaveBeenCalledWith('rekomendasi_surat_kerja', 40);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Pengajuan selesai',
      data: null
    });
  });

  test('petugas berhasil upload surat hasil jika file tersedia', async () => {
    VerifikasiPetugasModel.uploadSuratHasil.mockResolvedValue({
      success: true,
      affectedRows: 1
    });

    const req = createReq({
      file: {
        filename: 'surat_hasil_40.pdf',
        originalname: 'Surat Hasil.pdf'
      }
    });
    const res = createResMock();

    await VerifikasiPetugasController.uploadSuratHasil(req, res);

    expect(VerifikasiPetugasModel.uploadSuratHasil).toHaveBeenCalledWith(
      'rekomendasi_surat_kerja',
      40,
      '/uploads/surat-hasil/surat_hasil_40.pdf',
      'Surat Hasil.pdf'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Surat hasil berhasil diunggah',
      data: null
    });
  });

  test('request gagal jika status tidak valid', async () => {
    VerifikasiPetugasModel.verifikasi.mockResolvedValue({
      success: false,
      error: 'Layanan tidak valid'
    });

    const req = createReq({
      layanan: 'layanan_tidak_valid'
    });
    const res = createResMock();

    await VerifikasiPetugasController.verifikasi(req, res);

    expect(VerifikasiPetugasModel.verifikasi).toHaveBeenCalledWith('layanan_tidak_valid', 40);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Gagal memverifikasi pengajuan'
    });
  });

  test('request gagal jika pengajuan tidak ditemukan', async () => {
    VerifikasiPetugasModel.diproses.mockResolvedValue({
      success: true,
      affectedRows: 0
    });

    const req = createReq({
      body: {
        catatan_petugas: 'Dokumen sedang diproses'
      }
    });
    const res = createResMock();

    await VerifikasiPetugasController.diproses(req, res);

    expect(VerifikasiPetugasModel.diproses).toHaveBeenCalledWith(
      'rekomendasi_surat_kerja',
      40,
      'Dokumen sedang diproses'
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Pengajuan tidak ditemukan'
    });
  });
});
