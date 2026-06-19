jest.mock('../models/rekomendasiSuratAhliWarisModel', () => ({
  savePengajuan: jest.fn()
}));

const RekomendasiSuratAhliWarisController = require('../controllers/rekomendasiSuratAhliWarisController');
const RekomendasiSuratAhliWarisModel = require('../models/rekomendasiSuratAhliWarisModel');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Iterasi 1 - Pengajuan Surat Ahli Waris', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('berhasil membuat pengajuan dengan data valid', async () => {
    RekomendasiSuratAhliWarisModel.savePengajuan.mockResolvedValue({
      success: true,
      id: 111
    });

    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body: {
        nama_pewaris: '  Vivi  ',
        nik_pewaris: '1409020105890006',
        alamat_pewaris: '  Bukit Sari  ',
        nama_pemohon: '  Ahmad  ',
        nik_pemohon: '1409020105890007',
        alamat_pemohon: '  Pariaman  ',
        no_hp: '082181381471'
      }
    };
    const res = createResMock();

    await RekomendasiSuratAhliWarisController.buatPengajuan(req, res);

    expect(RekomendasiSuratAhliWarisModel.savePengajuan).toHaveBeenCalledTimes(1);
    expect(RekomendasiSuratAhliWarisModel.savePengajuan).toHaveBeenCalledWith({
      id_user: 1,
      nama_pewaris: 'Vivi',
      nik_pewaris: '1409020105890006',
      alamat_pewaris: 'Bukit Sari',
      nama_pemohon: 'Ahmad',
      nik_pemohon: '1409020105890007',
      alamat_pemohon: 'Pariaman',
      no_hp: '082181381471'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Pengajuan rekomendasi surat ahli waris berhasil dibuat',
      data: {
        id_pengajuan: 111,
        id_user: 1,
        status: 'Menunggu verifikasi',
        nama_pewaris: 'Vivi',
        nik_pewaris: '1409020105890006',
        alamat_pewaris: 'Bukit Sari',
        nama_pemohon: 'Ahmad',
        nik_pemohon: '1409020105890007',
        alamat_pemohon: 'Pariaman',
        no_hp: '082181381471'
      }
    });
  });

  test.each([
    ['nama_pewaris kosong', { nama_pewaris: '', nik_pewaris: '1409020105890006', alamat_pewaris: 'Bukit Sari', nama_pemohon: 'Ahmad', nik_pemohon: '1409020105890007', alamat_pemohon: 'Pariaman', no_hp: '082181381471' }, ['nama_pewaris tidak boleh kosong']],
    ['nik_pewaris kosong', { nama_pewaris: 'Vivi', nik_pewaris: '', alamat_pewaris: 'Bukit Sari', nama_pemohon: 'Ahmad', nik_pemohon: '1409020105890007', alamat_pemohon: 'Pariaman', no_hp: '082181381471' }, ['nik_pewaris tidak boleh kosong']],
    ['nik_pewaris kurang dari 16 digit', { nama_pewaris: 'Vivi', nik_pewaris: '123456789', alamat_pewaris: 'Bukit Sari', nama_pemohon: 'Ahmad', nik_pemohon: '1409020105890007', alamat_pemohon: 'Pariaman', no_hp: '082181381471' }, ['nik_pewaris harus valid (16 digit angka)']],
    ['alamat_pewaris kosong', { nama_pewaris: 'Vivi', nik_pewaris: '1409020105890006', alamat_pewaris: '', nama_pemohon: 'Ahmad', nik_pemohon: '1409020105890007', alamat_pemohon: 'Pariaman', no_hp: '082181381471' }, ['alamat_pewaris tidak boleh kosong']],
    ['nama_pemohon kosong', { nama_pewaris: 'Vivi', nik_pewaris: '1409020105890006', alamat_pewaris: 'Bukit Sari', nama_pemohon: '', nik_pemohon: '1409020105890007', alamat_pemohon: 'Pariaman', no_hp: '082181381471' }, ['nama_pemohon tidak boleh kosong']],
    ['nik_pemohon kosong', { nama_pewaris: 'Vivi', nik_pewaris: '1409020105890006', alamat_pewaris: 'Bukit Sari', nama_pemohon: 'Ahmad', nik_pemohon: '', alamat_pemohon: 'Pariaman', no_hp: '082181381471' }, ['nik_pemohon tidak boleh kosong']],
    ['nik_pemohon kurang dari 16 digit', { nama_pewaris: 'Vivi', nik_pewaris: '1409020105890006', alamat_pewaris: 'Bukit Sari', nama_pemohon: 'Ahmad', nik_pemohon: '123456789', alamat_pemohon: 'Pariaman', no_hp: '082181381471' }, ['nik_pemohon harus valid (16 digit angka)']],
    ['alamat_pemohon kosong', { nama_pewaris: 'Vivi', nik_pewaris: '1409020105890006', alamat_pewaris: 'Bukit Sari', nama_pemohon: 'Ahmad', nik_pemohon: '1409020105890007', alamat_pemohon: '', no_hp: '082181381471' }, ['alamat_pemohon tidak boleh kosong']],
    ['no_hp kosong', { nama_pewaris: 'Vivi', nik_pewaris: '1409020105890006', alamat_pewaris: 'Bukit Sari', nama_pemohon: 'Ahmad', nik_pemohon: '1409020105890007', alamat_pemohon: 'Pariaman', no_hp: '' }, ['no_hp tidak boleh kosong']]
  ])('gagal jika %s', async (_, body, expectedErrors) => {
    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body
    };
    const res = createResMock();

    await RekomendasiSuratAhliWarisController.buatPengajuan(req, res);

    expect(RekomendasiSuratAhliWarisModel.savePengajuan).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validasi gagal',
      errors: expectedErrors
    });
  });
});
