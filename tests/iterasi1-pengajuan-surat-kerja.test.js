jest.mock('../models/rekomendasiSuratKerjaModel', () => ({
  savePengajuan: jest.fn()
}));

const RekomendasiSuratKerjaController = require('../controllers/rekomendasiSuratKerjaController');
const RekomendasiSuratKerjaModel = require('../models/rekomendasiSuratKerjaModel');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Iterasi 1 - Pengajuan Surat Kerja', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('berhasil membuat pengajuan dengan data valid', async () => {
    RekomendasiSuratKerjaModel.savePengajuan.mockResolvedValue({
      success: true,
      id: 123
    });

    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body: {
        nama_pemohon: '  Vivi  ',
        alamat: '  Bukit Sari  ',
        nik: '1409020105890006',
        no_hp: '082181381471',
        keterangan: '  kebutuhan kerja  '
      }
    };
    const res = createResMock();

    await RekomendasiSuratKerjaController.buatPengajuan(req, res);

    expect(RekomendasiSuratKerjaModel.savePengajuan).toHaveBeenCalledTimes(1);
    expect(RekomendasiSuratKerjaModel.savePengajuan).toHaveBeenCalledWith({
      id_user: 1,
      nama_pemohon: 'Vivi',
      alamat: 'Bukit Sari',
      nik: '1409020105890006',
      no_hp: '082181381471',
      keterangan: 'kebutuhan kerja'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Pengajuan rekomendasi surat kerja berhasil dibuat',
      data: {
        id_pengajuan: 123,
        id_user: 1,
        status: 'Menunggu verifikasi',
        nama_pemohon: 'Vivi',
        alamat: 'Bukit Sari',
        nik: '1409020105890006',
        no_hp: '082181381471',
        keterangan: 'kebutuhan kerja'
      }
    });
  });

  test.each([
    ['nama_pemohon kosong', { nama_pemohon: '', alamat: 'Bukit Sari', nik: '1409020105890006', no_hp: '082181381471', keterangan: 'kebutuhan kerja' }, ['nama_pemohon tidak boleh kosong']],
    ['alamat kosong', { nama_pemohon: 'Vivi', alamat: '', nik: '1409020105890006', no_hp: '082181381471', keterangan: 'kebutuhan kerja' }, ['alamat tidak boleh kosong']],
    ['NIK kosong', { nama_pemohon: 'Vivi', alamat: 'Bukit Sari', nik: '', no_hp: '082181381471', keterangan: 'kebutuhan kerja' }, ['NIK tidak boleh kosong']],
    ['NIK kurang dari 16 digit', { nama_pemohon: 'Vivi', alamat: 'Bukit Sari', nik: '123456789', no_hp: '082181381471', keterangan: 'kebutuhan kerja' }, ['NIK harus valid (16 digit angka)']],
    ['no_hp kosong', { nama_pemohon: 'Vivi', alamat: 'Bukit Sari', nik: '1409020105890006', no_hp: '', keterangan: 'kebutuhan kerja' }, ['no_hp tidak boleh kosong']],
    ['keterangan kosong', { nama_pemohon: 'Vivi', alamat: 'Bukit Sari', nik: '1409020105890006', no_hp: '082181381471', keterangan: '' }, ['keterangan tidak boleh kosong']]
  ])('gagal jika %s', async (_, body, expectedErrors) => {
    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body
    };
    const res = createResMock();

    await RekomendasiSuratKerjaController.buatPengajuan(req, res);

    expect(RekomendasiSuratKerjaModel.savePengajuan).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validasi gagal',
      errors: expectedErrors
    });
  });
});
