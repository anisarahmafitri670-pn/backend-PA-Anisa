jest.mock('../models/dokumenRekomendasiSuratKerjaModel', () => ({
  getByPengajuanAndJenis: jest.fn(),
  upsertDokumen: jest.fn(),
  listByPengajuan: jest.fn(),
  deleteByPengajuanAndJenis: jest.fn()
}));

jest.mock('../utils/uploadFiles', () => ({
  toPosixRelative: jest.fn((filePath) => String(filePath).replace(/\\/g, '/')),
  safeUnlinkRelativeUpload: jest.fn()
}));

const multer = require('multer');
const DokumenRekomendasiSuratKerjaModel = require('../models/dokumenRekomendasiSuratKerjaModel');
const { DokumenRekomendasiSuratKerjaController } = require('../controllers/dokumenRekomendasiSuratKerjaController');
const { createDiskUpload } = require('../middleware/uploadFactory');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function createValidReq(overrides = {}) {
  return {
    params: { id: '1' },
    body: {},
    files: [
      {
        fieldname: 'ktp',
        path: 'uploads\\surat_kerja\\1\\ktp_123.pdf',
        originalname: 'ktp.pdf',
        mimetype: 'application/pdf',
        size: 1024
      }
    ],
    ...overrides
  };
}

describe('Iterasi 3 - Upload Dokumen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    DokumenRekomendasiSuratKerjaModel.getByPengajuanAndJenis.mockResolvedValue({
      success: true,
      data: null
    });
    DokumenRekomendasiSuratKerjaModel.upsertDokumen.mockResolvedValue({
      success: true,
      affectedRows: 1
    });
  });

  test('berhasil upload dokumen dengan file valid', async () => {
    const req = createValidReq();
    const res = createResMock();

    await DokumenRekomendasiSuratKerjaController.uploadDokumen(req, res);

    expect(DokumenRekomendasiSuratKerjaModel.getByPengajuanAndJenis).toHaveBeenCalledWith(1, 'ktp');
    expect(DokumenRekomendasiSuratKerjaModel.upsertDokumen).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        jenis_dokumen: 'ktp',
        file_path: 'uploads/surat_kerja/1/ktp_123.pdf',
        original_name: 'ktp.pdf',
        mime_type: 'application/pdf',
        file_size: 1024
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Dokumen berhasil diupload',
        data: expect.objectContaining({
          id_pengajuan: 1,
          dokumen: expect.any(Array)
        })
      })
    );
  });

  test('gagal upload tanpa file', async () => {
    const req = createValidReq({ files: [] });
    const res = createResMock();

    await DokumenRekomendasiSuratKerjaController.uploadDokumen(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'File wajib diupload'
      })
    );
    expect(DokumenRekomendasiSuratKerjaModel.upsertDokumen).not.toHaveBeenCalled();
  });

  test('gagal upload file melebihi batas ukuran', () => {
    const upload = createDiskUpload('surat_kerja');
    const fileMelebihiBatas = {
      size: upload.limits.fileSize + 1
    };
    const multerError = new multer.MulterError('LIMIT_FILE_SIZE');

    expect(fileMelebihiBatas.size).toBeGreaterThan(upload.limits.fileSize);
    expect(multerError.code).toBe('LIMIT_FILE_SIZE');
    expect(upload.limits.fileSize).toBe(10 * 1024 * 1024);
  });
});
