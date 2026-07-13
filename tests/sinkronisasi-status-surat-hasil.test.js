jest.mock('../models/pengajuanStatusModel', () => ({
  findById: jest.fn(),
  updateStatus: jest.fn(),
  uploadSuratHasil: jest.fn(),
  deleteSuratHasil: jest.fn()
}));

const PengajuanStatusController = require('../controllers/pengajuanStatusController');
const PengajuanStatusModel = require('../models/pengajuanStatusModel');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function createReq(overrides = {}) {
  return {
    protocol: 'http',
    get: jest.fn().mockReturnValue('localhost:3000'),
    params: { id: '41' },
    body: {
      layanan: 'rekomendasi_surat_kerja'
    },
    query: {},
    file: null,
    user: {
      id_user: 2,
      role: 'petugas'
    },
    ...overrides
  };
}

const rowSelesai = {
  id_pengajuan: 41,
  id_user: 10,
  nama_pemohon: 'Anisa',
  status: 'Selesai',
  catatan_petugas: 'Selesai diproses',
  file_surat_hasil: '/uploads/surat-hasil/surat_41.pdf',
  nama_file_surat_hasil: 'Surat Hasil.pdf'
};

describe('Sinkronisasi Status dan Surat Hasil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('update status menjadi Selesai tersimpan dan dikembalikan pada response', async () => {
    PengajuanStatusModel.findById.mockResolvedValue({
      layanan: 'rekomendasi_surat_kerja',
      row: { ...rowSelesai, status: 'Diproses', file_surat_hasil: null }
    });
    PengajuanStatusModel.updateStatus.mockResolvedValue({
      success: true,
      affectedRows: 1,
      layanan: 'rekomendasi_surat_kerja',
      data: rowSelesai
    });

    const req = createReq({
      body: {
        layanan: 'rekomendasi_surat_kerja',
        status_pengajuan: 'selesai',
        catatan_petugas: 'Selesai diproses'
      }
    });
    const res = createResMock();

    await PengajuanStatusController.updateStatus(req, res);

    expect(PengajuanStatusModel.updateStatus).toHaveBeenCalledWith(
      41,
      'rekomendasi_surat_kerja',
      'Selesai',
      'Selesai diproses'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.status_pengajuan).toBe('Selesai');
  });

  test('upload surat hasil membuat status menjadi Selesai dan tidak kembali Menunggu Verifikasi', async () => {
    PengajuanStatusModel.findById.mockResolvedValue({
      layanan: 'rekomendasi_surat_kerja',
      row: { ...rowSelesai, status: 'Diproses', file_surat_hasil: null }
    });
    PengajuanStatusModel.uploadSuratHasil.mockResolvedValue({
      success: true,
      affectedRows: 1,
      layanan: 'rekomendasi_surat_kerja',
      oldFilePath: null,
      data: rowSelesai
    });

    const req = createReq({
      file: {
        filename: 'surat_41.pdf',
        originalname: 'Surat Hasil.pdf'
      }
    });
    const res = createResMock();

    await PengajuanStatusController.uploadSuratHasil(req, res);

    expect(PengajuanStatusModel.uploadSuratHasil).toHaveBeenCalledWith(
      41,
      'rekomendasi_surat_kerja',
      '/uploads/surat-hasil/surat_41.pdf',
      'Surat Hasil.pdf'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.status_pengajuan).toBe('Selesai');
    expect(res.json.mock.calls[0][0].data.status_pengajuan).not.toBe('Menunggu Verifikasi');
    expect(res.json.mock.calls[0][0].data.nama_file_surat_hasil).toBe('Surat Hasil.pdf');
  });

  test('detail pengajuan menampilkan file_surat_hasil dan nama_file_surat_hasil', async () => {
    PengajuanStatusModel.findById.mockResolvedValue({
      layanan: 'rekomendasi_surat_kerja',
      row: rowSelesai
    });

    const req = createReq({
      user: {
        id_user: 10,
        role: 'masyarakat'
      }
    });
    const res = createResMock();

    await PengajuanStatusController.detail(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.file_surat_hasil).toBe('/uploads/surat-hasil/surat_41.pdf');
    expect(res.json.mock.calls[0][0].data.nama_file_surat_hasil).toBe('Surat Hasil.pdf');
    expect(res.json.mock.calls[0][0].data.surat_hasil_url).toBe('http://localhost:3000/uploads/surat-hasil/surat_41.pdf');
  });

  test('hapus surat hasil mengosongkan file dan mengubah status menjadi Diproses', async () => {
    PengajuanStatusModel.deleteSuratHasil.mockResolvedValue({
      success: true,
      affectedRows: 1,
      layanan: 'rekomendasi_surat_kerja',
      oldFilePath: '/uploads/surat-hasil/surat_41.pdf',
      data: {
        ...rowSelesai,
        status: 'Diproses',
        file_surat_hasil: null,
        nama_file_surat_hasil: null
      }
    });

    const req = createReq();
    const res = createResMock();

    await PengajuanStatusController.deleteSuratHasil(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.status_pengajuan).toBe('Diproses');
    expect(res.json.mock.calls[0][0].data.file_surat_hasil).toBeNull();
    expect(res.json.mock.calls[0][0].data.nama_file_surat_hasil).toBeNull();
  });

  test('masyarakat tidak dapat melihat pengajuan milik user lain', async () => {
    PengajuanStatusModel.findById.mockResolvedValue({
      layanan: 'rekomendasi_surat_kerja',
      row: {
        ...rowSelesai,
        id_user: 99
      }
    });

    const req = createReq({
      user: {
        id_user: 10,
        role: 'masyarakat'
      }
    });
    const res = createResMock();

    await PengajuanStatusController.detail(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Pengajuan tidak ditemukan'
    });
  });
});
