jest.mock('../models/userModel', () => ({
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  createUser: jest.fn()
}));

jest.mock('../models/userLoginHistoryModel', () => ({
  createHistory: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const UserLoginHistoryModel = require('../models/userLoginHistoryModel');
const AuthController = require('../controllers/authController');
const UserLoginHistoryController = require('../controllers/userLoginHistoryController');
const authMiddleware = require('../middleware/auth');

function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Iterasi 2 - Autentikasi & Otorisasi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1d';
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
  });

  describe('Register', () => {
    test('berhasil register dengan data valid', async () => {
      UserModel.findByUsername.mockResolvedValue({ success: true, data: null });
      UserModel.findByEmail.mockResolvedValue({ success: true, data: null });
      bcrypt.hash.mockResolvedValue('hashed-password');
      UserModel.createUser.mockResolvedValue({ success: true, id: 99 });

      const req = {
        body: {
          nama_lengkap: 'Anisa Rahma',
          username: 'anisar',
          email: 'anisa@example.com',
          password: 'rahasia'
        }
      };
      const res = createResMock();

      await AuthController.register(req, res);

      expect(UserModel.findByUsername).toHaveBeenCalledWith('anisar');
      expect(UserModel.findByEmail).toHaveBeenCalledWith('anisa@example.com');
      expect(UserModel.createUser).toHaveBeenCalledWith({
        nama: 'Anisa Rahma',
        username: 'anisar',
        email: 'anisa@example.com',
        passwordHash: 'hashed-password',
        role: 'masyarakat'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Register berhasil',
        data: {
          id_user: 99,
          nama_lengkap: 'Anisa Rahma',
          username: 'anisar',
          email: 'anisa@example.com',
          role: 'masyarakat'
        }
      });
    });

    test.each([
      ['username kosong', { nama_lengkap: 'Anisa Rahma', username: '', email: 'anisa@example.com', password: 'rahasia' }, ['Username minimal 4 karakter']],
      ['email kosong', { nama_lengkap: 'Anisa Rahma', username: 'anisar', email: '', password: 'rahasia' }, ['email tidak valid']],
      ['password kosong', { nama_lengkap: 'Anisa Rahma', username: 'anisar', email: 'anisa@example.com', password: '' }, ['Password tidak boleh kosong', 'Password minimal 4 karakter']]
    ])('gagal jika %s', async (_, body, expectedErrors) => {
      const req = { body };
      const res = createResMock();

      await AuthController.register(req, res);

      expect(UserModel.findByUsername).not.toHaveBeenCalled();
      expect(UserModel.findByEmail).not.toHaveBeenCalled();
      expect(UserModel.createUser).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validasi gagal',
        errors: expectedErrors
      });
    });

    test('gagal jika email sudah digunakan', async () => {
      UserModel.findByUsername.mockResolvedValue({ success: true, data: null });
      UserModel.findByEmail.mockResolvedValue({
        success: true,
        data: { id_user: 10, email: 'anisa@example.com' }
      });

      const req = {
        body: {
          nama_lengkap: 'Anisa Rahma',
          username: 'anisar',
          email: 'anisa@example.com',
          password: 'rahasia'
        }
      };
      const res = createResMock();

      await AuthController.register(req, res);

      expect(UserModel.findByUsername).toHaveBeenCalledTimes(1);
      expect(UserModel.findByEmail).toHaveBeenCalledTimes(1);
      expect(UserModel.createUser).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email sudah terdaftar'
      });
    });
  });

  describe('Login', () => {
    test('berhasil login dengan username dan password benar', async () => {
      UserModel.findByUsername.mockResolvedValue({
        success: true,
        data: {
          id_user: 21,
          nama_lengkap: 'Kepala Camat A',
          username: 'kcamat',
          email: 'kcamat@example.com',
          password: 'hashed-password',
          role: 'kepala camat',
          no_hp: '081234567890',
          alamat: 'Rantau Kopar',
          avatar: '/uploads/avatar/avatar_21.png'
        }
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token-123');
      UserLoginHistoryModel.createHistory.mockResolvedValue({ success: true, id: 1 });

      const req = {
        body: {
          username: 'kcamat',
          password: 'rahasia'
        }
      };
      const res = createResMock();

      await AuthController.login(req, res);

      expect(UserModel.findByUsername).toHaveBeenCalledWith('kcamat');
      expect(bcrypt.compare).toHaveBeenCalledWith('rahasia', 'hashed-password');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id_user: 21, username: 'kcamat', role: 'kepala camat' },
        'test-secret',
        { expiresIn: '1d' }
      );
      expect(UserLoginHistoryModel.createHistory).toHaveBeenCalledWith({
        id_user: 21,
        aktivitas: 'login'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login berhasil',
        data: {
          accessToken: 'token-123',
          user: {
            id_user: 21,
            nama_lengkap: 'Kepala Camat A',
            username: 'kcamat',
            email: 'kcamat@example.com',
            role: 'kepala camat',
            no_hp: '081234567890',
            alamat: 'Rantau Kopar',
            avatar: '/uploads/avatar/avatar_21.png'
          }
        }
      });
    });

    test('login berhasil menghasilkan accessToken', async () => {
      UserModel.findByUsername.mockResolvedValue({
        success: true,
        data: {
          id_user: 21,
          nama_lengkap: 'Anisa',
          username: 'anisar',
          email: 'anisa@example.com',
          password: 'hashed-password',
          role: 'masyarakat'
        }
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token-abc');
      UserLoginHistoryModel.createHistory.mockResolvedValue({ success: true });

      const req = { body: { username: 'anisar', password: 'rahasia' } };
      const res = createResMock();

      await AuthController.login(req, res);

      const response = res.json.mock.calls[0][0];
      expect(res.status).toHaveBeenCalledWith(200);
      expect(response.data.accessToken).toBe('token-abc');
    });

    test('response login mengandung user.id_user, username, email, dan role', async () => {
      UserModel.findByUsername.mockResolvedValue({
        success: true,
        data: {
          id_user: 21,
          nama_lengkap: 'Anisa',
          username: 'anisar',
          email: 'anisa@example.com',
          password: 'hashed-password',
          role: 'masyarakat'
        }
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token-abc');
      UserLoginHistoryModel.createHistory.mockResolvedValue({ success: true });

      const req = { body: { username: 'anisar', password: 'rahasia' } };
      const res = createResMock();

      await AuthController.login(req, res);

      const user = res.json.mock.calls[0][0].data.user;
      expect(user).toEqual(expect.objectContaining({
        id_user: 21,
        username: 'anisar',
        email: 'anisa@example.com',
        role: 'masyarakat'
      }));
    });

    test.each([
      ['username kosong', { username: '', password: 'rahasia' }, ['Username minimal 4 karakter']],
      ['password kosong', { username: 'kcamat', password: '' }, ['Password minimal 4 karakter']]
    ])('gagal jika %s', async (_, body, expectedErrors) => {
      const req = { body };
      const res = createResMock();

      await AuthController.login(req, res);

      expect(UserModel.findByUsername).not.toHaveBeenCalled();
      expect(UserLoginHistoryModel.createHistory).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validasi gagal',
        errors: expectedErrors
      });
    });

    test('gagal jika username tidak ditemukan', async () => {
      UserModel.findByUsername.mockResolvedValue({ success: true, data: null });

      const req = {
        body: {
          username: 'unknownuser',
          password: 'rahasia'
        }
      };
      const res = createResMock();

      await AuthController.login(req, res);

      expect(UserModel.findByUsername).toHaveBeenCalledWith('unknownuser');
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username atau password salah'
      });
    });

    test('gagal jika password salah', async () => {
      UserModel.findByUsername.mockResolvedValue({
        success: true,
        data: {
          id_user: 21,
          nama_lengkap: 'Anisa',
          username: 'anisar',
          email: 'anisa@example.com',
          password: 'hashed-password',
          role: 'masyarakat',
          no_hp: null,
          alamat: null,
          avatar: null
        }
      });
      bcrypt.compare.mockResolvedValue(false);

      const req = {
        body: {
          username: 'anisar',
          password: 'salah'
        }
      };
      const res = createResMock();

      await AuthController.login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('salah', 'hashed-password');
      expect(UserLoginHistoryModel.createHistory).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username atau password salah'
      });
    });
  });

  describe('Logout', () => {
    test('logout berhasil menghasilkan response success true', async () => {
      UserLoginHistoryModel.createHistory.mockResolvedValue({ success: true });

      const req = {
        user: {
          id_user: 21,
          role: 'masyarakat'
        }
      };
      const res = createResMock();

      await UserLoginHistoryController.logout(req, res);

      expect(UserLoginHistoryModel.createHistory).toHaveBeenCalledWith({
        id_user: 21,
        aktivitas: 'logout'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].success).toBe(true);
    });

    test('logout berhasil menghasilkan message Logout berhasil', async () => {
      UserLoginHistoryModel.createHistory.mockResolvedValue({ success: true });

      const req = {
        user: {
          id_user: 21,
          role: 'masyarakat'
        }
      };
      const res = createResMock();

      await UserLoginHistoryController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout berhasil',
        data: null
      });
    });
  });

  describe('Token', () => {
    test('token tidak valid menghasilkan status 401', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      const req = {
        headers: {
          authorization: 'Bearer token-tidak-valid'
        }
      };
      const res = createResMock();
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token tidak valid'
      });
    });

    test('token expired menghasilkan status 401', () => {
      jwt.verify.mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const req = {
        headers: {
          authorization: 'Bearer token-expired'
        }
      };
      const res = createResMock();
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token tidak valid'
      });
    });
  });
});
