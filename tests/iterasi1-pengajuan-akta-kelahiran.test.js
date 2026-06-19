jest.mock('../models/rekomendasiAktaKelahiranModel', () => ({
  savePengajuan: jest.fn()
}));

const RekomendasiAktaKelahiranController = require('../controllers/rekomendasiAktaKelahiranController');
const RekomendasiAktaKelahiranModel = require('../models/rekomendasiAktaKelahiranModel');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Iterasi 1 - Pengajuan Akta Kelahiran', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('berhasil membuat pengajuan dengan data valid', async () => {
    RekomendasiAktaKelahiranModel.savePengajuan.mockResolvedValue({
      success: true,
      id: 654
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
        no_hp: '082181381471'
      }
    };
    const res = createResMock();

    await RekomendasiAktaKelahiranController.buatPengajuan(req, res);

    expect(RekomendasiAktaKelahiranModel.savePengajuan).toHaveBeenCalledTimes(1);
    expect(RekomendasiAktaKelahiranModel.savePengajuan).toHaveBeenCalledWith({
      id_user: 1,
      nama_pemohon: 'Vivi',
      alamat: 'Bukit Sari',
      nik: '1409020105890006',
      no_hp: '082181381471'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Pengajuan rekomendasi akta kelahiran berhasil dibuat',
      data: {
        id_pengajuan: 654,
        id_user: 1,
        status: 'Menunggu verifikasi',
        nama_pemohon: 'Vivi',
        alamat: 'Bukit Sari',
        nik: '1409020105890006',
        no_hp: '082181381471'
      }
    });
  });

  test.each([
    ['nama_pemohon kosong', { nama_pemohon: '', alamat: 'Bukit Sari', nik: '1409020105890006', no_hp: '082181381471' }, ['nama_pemohon tidak boleh kosong']],
    ['alamat kosong', { nama_pemohon: 'Vivi', alamat: '', nik: '1409020105890006', no_hp: '082181381471' }, ['alamat tidak boleh kosong']],
    ['NIK kosong', { nama_pemohon: 'Vivi', alamat: 'Bukit Sari', nik: '', no_hp: '082181381471' }, ['NIK tidak boleh kosong']],
    ['NIK kurang dari 16 digit', { nama_pemohon: 'Vivi', alamat: 'Bukit Sari', nik: '123456789', no_hp: '082181381471' }, ['NIK harus valid (16 digit angka)']],
    ['no_hp kosong', { nama_pemohon: 'Vivi', alamat: 'Bukit Sari', nik: '1409020105890006', no_hp: '' }, ['no_hp tidak boleh kosong']]
  ])('gagal jika %s', async (_, body, expectedErrors) => {
    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body
    };
    const res = createResMock();

    await RekomendasiAktaKelahiranController.buatPengajuan(req, res);

    expect(RekomendasiAktaKelahiranModel.savePengajuan).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validasi gagal',
      errors: expectedErrors
    });
  });
});
