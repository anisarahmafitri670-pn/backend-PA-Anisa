/**
 * @openapi
 * components:
 *   schemas:
 *     ValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Validasi gagal
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - nama_pemohon tidak boleh kosong
 *     ServerError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Terjadi kesalahan pada server
 *     RegisterRequest:
 *       type: object
 *       required: [nama_lengkap, username, email, password]
 *       properties:
 *         nama_lengkap:
 *           type: string
 *           example: Anisa Rahma Fitri
 *         username:
 *           type: string
 *           minLength: 4
 *           example: anisa2003
 *         email:
 *           type: string
 *           format: email
 *           example: anisa@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 4
 *           example: rahasia123
 *     LoginRequest:
 *       type: object
 *       required: [username, password]
 *       properties:
 *         username:
 *           type: string
 *           example: anisa2003
 *         password:
 *           type: string
 *           format: password
 *           example: rahasia123
 *     User:
 *       type: object
 *       properties:
 *         id_user:
 *           type: integer
 *           example: 860
 *         nama_lengkap:
 *           type: string
 *           example: Anisa Rahma Fitri
 *         username:
 *           type: string
 *           example: anisa2003
 *         email:
 *           type: string
 *           format: email
 *           example: anisa@example.com
 *         role:
 *           type: string
 *           example: masyarakat
 *         no_hp:
 *           type: string
 *           nullable: true
 *           example: '082181381471'
 *         alamat:
 *           type: string
 *           nullable: true
 *           example: Rantau Kopar
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: /uploads/avatar/avatar.png
 *     PengajuanSuccess:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Pengajuan berhasil dibuat
 *         data:
 *           type: object
 *           additionalProperties: true
 *           properties:
 *             id_pengajuan:
 *               type: integer
 *               example: 44
 *             id_user:
 *               type: integer
 *               example: 17
 *             status:
 *               type: string
 *               example: Menunggu Verifikasi
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Mendaftarkan akun masyarakat
 *     description: Membuat akun baru dengan role awal masyarakat.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       '201':
 *         description: Register berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Register berhasil }
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *       '400':
 *         description: Data register tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       '409':
 *         description: Username atau email sudah digunakan
 *       '500':
 *         description: Kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login pengguna
 *     description: Memvalidasi username dan password lalu mengembalikan JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Login berhasil }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken: { type: string, example: eyJhbGciOiJIUzI1NiIs... }
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       '400':
 *         description: Username atau password kosong
 *       '401':
 *         description: Username atau password salah
 *       '403':
 *         description: Role user tidak valid
 *       '500':
 *         description: Kesalahan server
 */

/**
 * @openapi
 * /api/rekomendasi_penelitian:
 *   post:
 *     tags: [Pengajuan Layanan]
 *     summary: Membuat pengajuan rekomendasi penelitian
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_peneliti, instansi, topik_penelitian, lokasi_penelitian, waktu_penelitian]
 *             properties:
 *               nama_peneliti: { type: string, example: Anisa Rahma Fitri }
 *               instansi: { type: string, example: Universitas Andalas }
 *               topik_penelitian: { type: string, example: Pelayanan administrasi kecamatan }
 *               lokasi_penelitian: { type: string, example: Kecamatan Rantau Kopar }
 *               waktu_penelitian: { type: string, format: date, example: '2026-08-20' }
 *     responses:
 *       '201':
 *         description: Rekomendasi penelitian berhasil dibuat
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PengajuanSuccess' }
 *       '400':
 *         description: Validasi gagal
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 *       '401': { description: Token tidak ditemukan atau tidak valid }
 *       '500': { description: Kesalahan server }
 * /api/rekomendasi_surat_pindah:
 *   post:
 *     tags: [Pengajuan Layanan]
 *     summary: Membuat pengajuan rekomendasi surat pindah
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_lengkap, alamat_asal, alamat_pindah, keterangan]
 *             properties:
 *               nama_lengkap: { type: string, example: Anisa Rahma Fitri }
 *               alamat_asal: { type: string, example: Rantau Kopar }
 *               alamat_pindah: { type: string, example: Pekanbaru }
 *               keterangan: { type: string, example: Pindah domisili }
 *     responses:
 *       '201':
 *         description: Pengajuan rekomendasi surat pindah berhasil dibuat
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PengajuanSuccess' }
 *       '400': { description: Validasi gagal }
 *       '401': { description: Token tidak ditemukan atau tidak valid }
 *       '500': { description: Kesalahan server }
 * /api/rekomendasi_akta_kelahiran:
 *   post:
 *     tags: [Pengajuan Layanan]
 *     summary: Membuat pengajuan rekomendasi akta kelahiran
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_pemohon, alamat, nik, no_hp]
 *             properties:
 *               nama_pemohon: { type: string, example: Anisa Rahma Fitri }
 *               alamat: { type: string, example: Rantau Kopar }
 *               nik: { type: string, pattern: '^\\d{16}$', example: '1409020105890006' }
 *               no_hp: { type: string, example: '082181381471' }
 *     responses:
 *       '201':
 *         description: Pengajuan rekomendasi akta kelahiran berhasil dibuat
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PengajuanSuccess' }
 *       '400': { description: Validasi gagal }
 *       '401': { description: Token tidak ditemukan atau tidak valid }
 *       '500': { description: Kesalahan server }
 * /api/rekomendasi_kartu_keluarga:
 *   post:
 *     tags: [Pengajuan Layanan]
 *     summary: Membuat pengajuan rekomendasi kartu keluarga
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_pemohon, alamat, nik, no_hp]
 *             properties:
 *               nama_pemohon: { type: string, example: Anisa Rahma Fitri }
 *               alamat: { type: string, example: Rantau Kopar }
 *               nik: { type: string, pattern: '^\\d{16}$', example: '1409020105890006' }
 *               no_hp: { type: string, example: '082181381471' }
 *     responses:
 *       '201':
 *         description: Pengajuan rekomendasi kartu keluarga berhasil dibuat
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PengajuanSuccess' }
 *       '400': { description: Validasi gagal }
 *       '401': { description: Token tidak ditemukan atau tidak valid }
 *       '500': { description: Kesalahan server }
 */

/**
 * @openapi
 * /api/rekomendasi_surat_kerja:
 *   post:
 *     tags: [Pengajuan Layanan]
 *     summary: Membuat pengajuan rekomendasi surat kerja
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_pemohon, alamat, nik, no_hp, keterangan]
 *             properties:
 *               nama_pemohon: { type: string, example: Anisa Rahma Fitri }
 *               alamat: { type: string, example: Rantau Kopar }
 *               nik: { type: string, pattern: '^\\d{16}$', example: '1409020105890006' }
 *               no_hp: { type: string, example: '082181381471' }
 *               keterangan: { type: string, example: Persyaratan administrasi pekerjaan }
 *     responses:
 *       '201':
 *         description: Pengajuan rekomendasi surat kerja berhasil dibuat
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PengajuanSuccess' }
 *       '400': { description: Validasi gagal }
 *       '401': { description: Token tidak ditemukan atau tidak valid }
 *       '500': { description: Kesalahan server }
 * /api/rekomendasi_surat_tanah:
 *   post:
 *     tags: [Pengajuan Layanan]
 *     summary: Membuat pengajuan rekomendasi surat tanah
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_pemohon, alamat, nik, no_hp]
 *             properties:
 *               nama_pemohon: { type: string, example: Anisa Rahma Fitri }
 *               alamat: { type: string, example: Rantau Kopar }
 *               nik: { type: string, pattern: '^\\d{16}$', example: '1409020105890006' }
 *               no_hp: { type: string, example: '082181381471' }
 *     responses:
 *       '201':
 *         description: Pengajuan rekomendasi surat tanah berhasil dibuat
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PengajuanSuccess' }
 *       '400': { description: Validasi gagal }
 *       '401': { description: Token tidak ditemukan atau tidak valid }
 *       '500': { description: Kesalahan server }
 * /api/rekomendasi_surat_ahli_waris:
 *   post:
 *     tags: [Pengajuan Layanan]
 *     summary: Membuat pengajuan rekomendasi surat ahli waris
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_pewaris, nik_pewaris, alamat_pewaris, nama_pemohon, nik_pemohon, alamat_pemohon, no_hp]
 *             properties:
 *               nama_pewaris: { type: string, example: Siti Aminah }
 *               nik_pewaris: { type: string, pattern: '^\\d{16}$', example: '1409020105890006' }
 *               alamat_pewaris: { type: string, example: Rantau Kopar }
 *               nama_pemohon: { type: string, example: Ahmad }
 *               nik_pemohon: { type: string, pattern: '^\\d{16}$', example: '1409020105890007' }
 *               alamat_pemohon: { type: string, example: Rantau Kopar }
 *               no_hp: { type: string, example: '082181381471' }
 *     responses:
 *       '201':
 *         description: Pengajuan rekomendasi surat ahli waris berhasil dibuat
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PengajuanSuccess' }
 *       '400': { description: Validasi gagal }
 *       '401': { description: Token tidak ditemukan atau tidak valid }
 *       '500': { description: Kesalahan server }
 * /api/rekomendasi_surat_yayasan:
 *   post:
 *     tags: [Pengajuan Layanan]
 *     summary: Membuat pengajuan rekomendasi yayasan, TPQ, atau Ormas
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_pemohon, nik, jabatan, nama_lembaga, alamat_lembaga]
 *             properties:
 *               nama_pemohon: { type: string, example: Anisa Rahma Fitri }
 *               nik: { type: string, pattern: '^\\d{16}$', example: '1409020105890006' }
 *               jabatan: { type: string, example: Ketua }
 *               nama_lembaga: { type: string, example: Yayasan Harapan }
 *               alamat_lembaga: { type: string, example: Rantau Kopar }
 *     responses:
 *       '201':
 *         description: Pengajuan rekomendasi surat yayasan berhasil dibuat
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PengajuanSuccess' }
 *       '400': { description: Validasi gagal }
 *       '401': { description: Token tidak ditemukan atau tidak valid }
 *       '500': { description: Kesalahan server }
 */

module.exports = {};
