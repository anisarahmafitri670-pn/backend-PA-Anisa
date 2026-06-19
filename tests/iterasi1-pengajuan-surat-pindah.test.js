jest.mock('../models/rekomendasiSuratPindahModel', () => ({
  savePengajuan: jest.fn()
}));

const RekomendasiSuratPindahController = require('../controllers/rekomendasiSuratPindahController');
const RekomendasiSuratPindahModel = require('../models/rekomendasiSuratPindahModel');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Iterasi 1 - Pengajuan Surat Pindah', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('berhasil membuat pengajuan dengan data valid', async () => {
    RekomendasiSuratPindahModel.savePengajuan.mockResolvedValue({
      success: true,
      id: 321
    });

    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body: {
        nama_lengkap: '  Vivi  ',
        alamat_asal: '  Bukit Sari  ',
        alamat_pindah: '  Pariaman  ',
        keterangan: '  pindah kerja  '
      }
    };
    const res = createResMock();

    await RekomendasiSuratPindahController.buatPengajuan(req, res);

    expect(RekomendasiSuratPindahModel.savePengajuan).toHaveBeenCalledTimes(1);
    expect(RekomendasiSuratPindahModel.savePengajuan).toHaveBeenCalledWith({
      id_user: 1,
      nama_lengkap: 'Vivi',
      alamat_asal: 'Bukit Sari',
      alamat_pindah: 'Pariaman',
      keterangan: 'pindah kerja'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Pengajuan rekomendasi surat pindah berhasil dibuat',
      data: {
        id_pengajuan: 321,
        id_user: 1,
        status: 'Menunggu verifikasi',
        nama_lengkap: 'Vivi',
        alamat_asal: 'Bukit Sari',
        alamat_pindah: 'Pariaman',
        keterangan: 'pindah kerja'
      }
    });
  });

  test.each([
    ['nama_lengkap kosong', { nama_lengkap: '', alamat_asal: 'Bukit Sari', alamat_pindah: 'Pariaman', keterangan: 'pindah kerja' }, ['nama_lengkap tidak boleh kosong']],
    ['alamat_asal kosong', { nama_lengkap: 'Vivi', alamat_asal: '', alamat_pindah: 'Pariaman', keterangan: 'pindah kerja' }, ['alamat_asal tidak boleh kosong']],
    ['alamat_pindah kosong', { nama_lengkap: 'Vivi', alamat_asal: 'Bukit Sari', alamat_pindah: '', keterangan: 'pindah kerja' }, ['alamat_pindah tidak boleh kosong']],
    ['alamat_pindah terlalu pendek', { nama_lengkap: 'Vivi', alamat_asal: 'Bukit Sari', alamat_pindah: 'abc', keterangan: 'pindah kerja' }, ['alamat_pindah harus valid']],
    ['alamat_pindah sama dengan alamat_asal', { nama_lengkap: 'Vivi', alamat_asal: 'Pariaman', alamat_pindah: 'Pariaman', keterangan: 'pindah kerja' }, ['alamat_pindah harus berbeda dari alamat_asal']],
    ['keterangan kosong', { nama_lengkap: 'Vivi', alamat_asal: 'Bukit Sari', alamat_pindah: 'Pariaman', keterangan: '' }, ['keterangan tidak boleh kosong']]
  ])('gagal jika %s', async (_, body, expectedErrors) => {
    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body
    };
    const res = createResMock();

    await RekomendasiSuratPindahController.buatPengajuan(req, res);

    expect(RekomendasiSuratPindahModel.savePengajuan).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validasi gagal',
      errors: expectedErrors
    });
  });
});
