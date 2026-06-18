const jwt             = require('jsonwebtoken');
const { isBlacklisted } = require('../config/tokenBlacklist');

/**
 * Middleware autentikasi JWT.
 *
 * - Membaca header: Authorization: Bearer <token>
 * - Verifikasi signature & masa berlaku
 * - Cek blacklist (token yang sudah logout)
 * - Menambahkan req.user = decoded payload
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cek apakah token sudah di-blacklist (logout)
    if (decoded.jti && isBlacklisted(decoded.jti)) {
      return res.status(401).json({
        success: false,
        message: 'Token sudah tidak valid. Silakan login kembali.',
      });
    }

    req.user  = decoded;   // { id, email, peran, hak_akses, jti, iat, exp }
    req.token = token;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Sesi telah berakhir. Silakan login kembali.'
        : 'Token tidak valid.';

    return res.status(401).json({ success: false, message });
  }
}

module.exports = authenticate;
