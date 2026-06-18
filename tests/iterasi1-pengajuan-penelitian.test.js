jest.mock('../models/rekomendasiPenelitianModel', () => ({
  saveRekomendasi: jest.fn()
}));

const RekomendasiPenelitianController = require('../controllers/rekomendasiPenelitianController');
const RekomendasiPenelitianModel = require('../models/rekomendasiPenelitianModel');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Iterasi 1 - Pengajuan Penelitian', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('berhasil membuat pengajuan dengan data valid', async () => {
    RekomendasiPenelitianModel.saveRekomendasi.mockResolvedValue({
      success: true,
      id: 789
    });

    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body: {
        nama_peneliti: '  Vivi  ',
        instansi: '  Universitas Andalas  ',
        topik_penelitian: '  Pendidikan  ',
        lokasi_penelitian: '  Bukittinggi  ',
        waktu_penelitian: '  2026-06-18  '
      }
    };
    const res = createResMock();

    await RekomendasiPenelitianController.buatRekomendasi(req, res);

    expect(RekomendasiPenelitianModel.saveRekomendasi).toHaveBeenCalledTimes(1);
    expect(RekomendasiPenelitianModel.saveRekomendasi).toHaveBeenCalledWith({
      id_user: 1,
      nama_peneliti: 'Vivi',
      instansi: 'Universitas Andalas',
      topik_penelitian: 'Pendidikan',
      lokasi_penelitian: 'Bukittinggi',
      waktu_penelitian: '2026-06-18'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Rekomendasi penelitian berhasil dibuat',
      data: {
        id_pengajuan: 789,
        id_user: 1,
        nama_peneliti: 'Vivi',
        instansi: 'Universitas Andalas',
        topik_penelitian: 'Pendidikan',
        lokasi_penelitian: 'Bukittinggi',
        waktu_penelitian: '2026-06-18'
      }
    });
  });

  test.each([
    ['nama_peneliti kosong', { nama_peneliti: '', instansi: 'Universitas Andalas', topik_penelitian: 'Pendidikan', lokasi_penelitian: 'Bukittinggi', waktu_penelitian: '2026-06-18' }, ['nama_peneliti tidak boleh kosong']],
    ['instansi kosong', { nama_peneliti: 'Vivi', instansi: '', topik_penelitian: 'Pendidikan', lokasi_penelitian: 'Bukittinggi', waktu_penelitian: '2026-06-18' }, ['instansi tidak boleh kosong']],
    ['topik_penelitian kosong', { nama_peneliti: 'Vivi', instansi: 'Universitas Andalas', topik_penelitian: '', lokasi_penelitian: 'Bukittinggi', waktu_penelitian: '2026-06-18' }, ['topik_penelitian tidak boleh kosong']],
    ['lokasi_penelitian kosong', { nama_peneliti: 'Vivi', instansi: 'Universitas Andalas', topik_penelitian: 'Pendidikan', lokasi_penelitian: '', waktu_penelitian: '2026-06-18' }, ['lokasi_penelitian tidak boleh kosong']],
    ['waktu_penelitian kosong', { nama_peneliti: 'Vivi', instansi: 'Universitas Andalas', topik_penelitian: 'Pendidikan', lokasi_penelitian: 'Bukittinggi', waktu_penelitian: '' }, ['waktu_penelitian tidak boleh kosong']]
  ])('gagal jika %s', async (_, body, expectedErrors) => {
    const req = {
      user: {
        id_user: 1,
        role: 'masyarakat'
      },
      body
    };
    const res = createResMock();

    await RekomendasiPenelitianController.buatRekomendasi(req, res);

    expect(RekomendasiPenelitianModel.saveRekomendasi).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validasi gagal',
      errors: expectedErrors
    });
  });
});
