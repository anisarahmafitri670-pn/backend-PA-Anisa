jest.mock('../models/kepalaCamatLaporanModel', () => ({
  getAllPengajuan: jest.fn(),
  getDetailByLayananAndId: jest.fn()
}));

const KepalaCamatController = require('../controllers/kepalaCamatController');
const KepalaCamatLaporanModel = require('../models/kepalaCamatLaporanModel');
const authorizeRoles = require('../middleware/role');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function createReq(query = {}) {
  return {
    user: {
      id_user: 22,
      role: 'kepala camat'
    },
    query: {
      page: '1',
      limit: '10',
      ...query
    }
  };
}

function createDetailReq(id = 1) {
  return {
    user: {
      id_user: 22,
      role: 'kepala camat'
    },
    params: {
      layanan: 'rekomendasi_penelitian',
      id: String(id)
    }
  };
}

function createPenelitianRow({
  id_pengajuan = 1,
  nama_peneliti = 'Widya Putri',
  status = 'Menunggu Verifikasi',
  catatan_petugas = '',
  created_at = '2026-07-01T08:00:00.000Z',
  updated_at = '2026-07-02T09:00:00.000Z',
  file_surat_hasil = null
} = {}) {
  return {
    layanan: 'rekomendasi_penelitian',
    config: {
      table: 'rekomendasi_penelitian',
      dokumenTable: 'dokumen_rekomendasi_penelitian',
      label: 'Rekomendasi Penelitian',
      code: 'RP',
      namaField: 'nama_peneliti'
    },
    row: {
      id_pengajuan,
      id_user: 17,
      nama_peneliti,
      nim: '123456',
      universitas: 'Universitas Contoh',
      status,
      catatan_petugas,
      created_at,
      updated_at,
      file_surat_hasil,
      nama_file_surat_hasil: file_surat_hasil ? 'surat-hasil.pdf' : null
    }
  };
}

describe('Iterasi 6 - History Pengajuan Rekomendasi Penelitian Kepala Camat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('kepala camat berhasil melihat history pengajuan rekomendasi penelitian', async () => {
    const req = createReq({ layanan: 'rekomendasi_penelitian' });
    const res = createResMock();

    KepalaCamatLaporanModel.getAllPengajuan.mockResolvedValue({
      success: true,
      data: [
        createPenelitianRow({ id_pengajuan: 3, status: 'Diproses' }),
        createPenelitianRow({ id_pengajuan: 2, status: 'Menunggu Verifikasi' })
      ]
    });

    await KepalaCamatController.laporan(req, res);

    expect(KepalaCamatLaporanModel.getAllPengajuan).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          total_pengajuan: 2,
          daftar_pengajuan: expect.arrayContaining([
            expect.objectContaining({
              id_pengajuan: 3,
              nomor_pengajuan: 'RP-003',
              nama_pemohon: 'Widya Putri',
              jenis_layanan: 'Rekomendasi Penelitian',
              layanan: 'rekomendasi_penelitian',
              status: 'Diproses'
            })
          ])
        })
      })
    );
  });

  test('history menampilkan status terbaru, tanggal pengajuan, dan catatan petugas', async () => {
    const req = createReq({
      layanan: 'rekomendasi_penelitian',
      status: 'diproses'
    });
    const res = createResMock();

    KepalaCamatLaporanModel.getAllPengajuan.mockResolvedValue({
      success: true,
      data: [
        createPenelitianRow({
          id_pengajuan: 4,
          status: 'Diproses',
          catatan_petugas: 'Dokumen sedang diperiksa',
          created_at: '2026-07-03T10:00:00.000Z',
          updated_at: '2026-07-04T11:00:00.000Z'
        }),
        createPenelitianRow({
          id_pengajuan: 5,
          status: 'Selesai',
          catatan_petugas: 'Surat sudah selesai'
        })
      ]
    });

    await KepalaCamatController.laporan(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.daftar_pengajuan).toHaveLength(1);
    expect(payload.data.daftar_pengajuan[0]).toEqual(
      expect.objectContaining({
        id_pengajuan: 4,
        status: 'Diproses',
        tanggal_pengajuan: '2026-07-03',
        catatan_petugas: 'Dokumen sedang diperiksa'
      })
    );
  });

  test('jika belum ada history rekomendasi penelitian, response tetap berhasil dengan data kosong', async () => {
    const req = createReq({ layanan: 'rekomendasi_penelitian' });
    const res = createResMock();

    KepalaCamatLaporanModel.getAllPengajuan.mockResolvedValue({
      success: true,
      data: []
    });

    await KepalaCamatController.laporan(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          total_pengajuan: 0,
          daftar_pengajuan: []
        }),
        pagination: expect.objectContaining({
          total_data: 0,
          total_page: 0
        })
      })
    );
  });

  test('kepala camat berhasil melihat detail history pengajuan rekomendasi penelitian', async () => {
    const req = createDetailReq(7);
    const res = createResMock();

    KepalaCamatLaporanModel.getDetailByLayananAndId.mockResolvedValue({
      success: true,
      data: {
        ...createPenelitianRow({
          id_pengajuan: 7,
          status: 'Selesai',
          catatan_petugas: 'Surat hasil telah diterbitkan',
          file_surat_hasil: '/uploads/surat-hasil/hasil-penelitian.pdf'
        }),
        dokumen: [
          {
            id_dokumen: 1,
            jenis_dokumen: 'ktp_mahasiswa',
            file_path: '/uploads/penelitian/7/ktp.pdf',
            original_name: 'ktp.pdf',
            mime_type: 'application/pdf',
            file_size: 1200,
            uploaded_at: '2026-07-01T08:30:00.000Z'
          }
        ]
      }
    });

    await KepalaCamatController.detailLaporan(req, res);

    expect(KepalaCamatLaporanModel.getDetailByLayananAndId).toHaveBeenCalledWith('rekomendasi_penelitian', 7);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id_pengajuan: 7,
          nomor_pengajuan: 'RP-007',
          jenis_layanan: 'Rekomendasi Penelitian',
          status: 'Selesai',
          catatan_petugas: 'Surat hasil telah diterbitkan',
          file_surat_hasil: '/uploads/surat-hasil/hasil-penelitian.pdf',
          daftar_dokumen: [
            expect.objectContaining({
              jenis_dokumen: 'ktp_mahasiswa'
            })
          ]
        })
      })
    );
  });

  test('detail history menghasilkan 404 jika pengajuan rekomendasi penelitian tidak ditemukan', async () => {
    const req = createDetailReq(99);
    const res = createResMock();

    KepalaCamatLaporanModel.getDetailByLayananAndId.mockResolvedValue({
      success: true,
      data: null
    });

    await KepalaCamatController.detailLaporan(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Data pengajuan tidak ditemukan'
      })
    );
  });

  test('role selain kepala camat tidak boleh mengakses history pengajuan', () => {
    const req = {
      user: {
        id_user: 17,
        role: 'masyarakat'
      }
    };
    const res = createResMock();
    const next = jest.fn();

    authorizeRoles('kepala camat')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Forbidden'
    });
  });
});
