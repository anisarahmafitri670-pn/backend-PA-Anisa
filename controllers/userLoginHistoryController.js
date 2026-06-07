const UserLoginHistoryModel = require('../models/userLoginHistoryModel');
const R = require('../utils/response');

function getTokenUserId(req) {
  return req.user && req.user.id_user ? Number(req.user.id_user) : null;
}

class UserLoginHistoryController {
  static async logout(req, res) {
    try {
      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const result = await UserLoginHistoryModel.createHistory({
        id_user: idUser,
        aktivitas: 'logout'
      });

      if (!result.success) {
        return R.serverError(res, 'Gagal menyimpan history logout');
      }

      return R.ok(res, 'Logout berhasil', null);
    } catch (error) {
      return R.serverError(res);
    }
  }

  static async getLoginHistory(req, res) {
    try {
      const idUser = getTokenUserId(req);
      if (!idUser) {
        return R.unauthorized(res, 'Token tidak valid');
      }

      const result = await UserLoginHistoryModel.getHistoryByUserId(idUser);
      if (!result.success) {
        return R.serverError(res, 'Gagal mengambil history login');
      }

      return R.ok(res, 'Berhasil mengambil history login', result.data);
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = UserLoginHistoryController;
