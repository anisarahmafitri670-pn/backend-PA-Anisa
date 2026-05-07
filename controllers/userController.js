const UserModel = require('../models/userModel');
const R = require('../utils/response');

class UserController {
  static async hapusUser(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return R.badRequest(res, 'ID user tidak valid');
      }

      const result = await UserModel.deleteUser(id);
      if (!result.success) {
        return R.serverError(res, 'Gagal menghapus user');
      }

      if (result.affectedRows === 0) {
        return R.notFound(res, 'User tidak ditemukan');
      }

      return R.ok(res, 'User berhasil dihapus', null);
    } catch (error) {
      return R.serverError(res);
    }
  }
}

module.exports = UserController;
