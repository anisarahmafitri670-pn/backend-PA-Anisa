const R = require('../utils/response');

class KepalaCamatController {
  static async dashboard(req, res) {
    return R.ok(res, 'Dashboard kepala camat berhasil diakses', {
      user: {
        id_user: req.user.id_user,
        username: req.user.username,
        role: req.user.role
      }
    });
  }
}

module.exports = KepalaCamatController;
