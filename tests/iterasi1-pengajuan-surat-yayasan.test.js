jest.mock('../models/rekomendasiSuratYayasanModel', () => ({
  savePengajuan: jest.fn()
}));

const RekomendasiSuratYayasanController = require('../controllers/rekomendasiSuratYayasanController');
const RekomendasiSuratYayasanModel = require('../models/rekomendasiSuratYayasanModel');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Iterasi 1 - Pengajuan Surat Yayasan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('berhasil membuat pengajuan dengan data valid', async () => {
    RekomendasiSuratYayasanModel.savePengajuan.mockResolvedValue({
      success: true,
      id: 222
    });

    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body: {
        nama_pemohon: '  Vivi  ',
        nik: '1409020105890006',
        jabatan: '  Ketua  ',
        nama_lembaga: '  Yayasan Harapan  ',
        alamat_lembaga: '  Bukit Sari  '
      }
    };
    const res = createResMock();

    await RekomendasiSuratYayasanController.buatPengajuan(req, res);

    expect(RekomendasiSuratYayasanModel.savePengajuan).toHaveBeenCalledTimes(1);
    expect(RekomendasiSuratYayasanModel.savePengajuan).toHaveBeenCalledWith({
      id_user: 1,
      nama_pemohon: 'Vivi',
      nik: '1409020105890006',
      jabatan: 'Ketua',
      nama_lembaga: 'Yayasan Harapan',
      alamat_lembaga: 'Bukit Sari'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Pengajuan rekomendasi surat yayasan berhasil dibuat',
      data: {
        id_pengajuan: 222,
        id_user: 1,
        status: 'Menunggu verifikasi',
        nama_pemohon: 'Vivi',
        nik: '1409020105890006',
        jabatan: 'Ketua',
        nama_lembaga: 'Yayasan Harapan',
        alamat_lembaga: 'Bukit Sari'
      }
    });
  });

  test.each([
    ['nama_pemohon kosong', { nama_pemohon: '', nik: '1409020105890006', jabatan: 'Ketua', nama_lembaga: 'Yayasan Harapan', alamat_lembaga: 'Bukit Sari' }, ['nama_pemohon tidak boleh kosong']],
    ['NIK kosong', { nama_pemohon: 'Vivi', nik: '', jabatan: 'Ketua', nama_lembaga: 'Yayasan Harapan', alamat_lembaga: 'Bukit Sari' }, ['NIK tidak boleh kosong']],
    ['NIK kurang dari 16 digit', { nama_pemohon: 'Vivi', nik: '123456789', jabatan: 'Ketua', nama_lembaga: 'Yayasan Harapan', alamat_lembaga: 'Bukit Sari' }, ['NIK harus valid (16 digit angka)']],
    ['jabatan kosong', { nama_pemohon: 'Vivi', nik: '1409020105890006', jabatan: '', nama_lembaga: 'Yayasan Harapan', alamat_lembaga: 'Bukit Sari' }, ['jabatan tidak boleh kosong']],
    ['nama_lembaga kosong', { nama_pemohon: 'Vivi', nik: '1409020105890006', jabatan: 'Ketua', nama_lembaga: '', alamat_lembaga: 'Bukit Sari' }, ['nama_lembaga tidak boleh kosong']],
    ['alamat_lembaga kosong', { nama_pemohon: 'Vivi', nik: '1409020105890006', jabatan: 'Ketua', nama_lembaga: 'Yayasan Harapan', alamat_lembaga: '' }, ['alamat_lembaga tidak boleh kosong']]
  ])('gagal jika %s', async (_, body, expectedErrors) => {
    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body
    };
    const res = createResMock();

    await RekomendasiSuratYayasanController.buatPengajuan(req, res);

    expect(RekomendasiSuratYayasanModel.savePengajuan).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validasi gagal',
      errors: expectedErrors
    });
  });
});
