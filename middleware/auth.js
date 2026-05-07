const jwt = require('jsonwebtoken');
const R = require('../utils/response');

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return R.unauthorized(res, 'Token tidak ditemukan');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.trim() === '' || secret === 'change-me') {
      return R.serverError(res, 'JWT_SECRET belum diset di server');
    }

    const payload = jwt.verify(token, secret);
    req.user = payload;
    return next();
  } catch (error) {
    return R.unauthorized(res, 'Token tidak valid');
  }
}

module.exports = authenticate;
