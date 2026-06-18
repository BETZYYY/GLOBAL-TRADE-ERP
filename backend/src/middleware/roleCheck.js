/**
 * Role-based access control middleware.
 *
 * Hirarki permission:
 *  admin            → semua aksi
 *  finance_manager  → approve transaksi, lihat semua
 *  treasury_officer → buat transaksi, kelola hedging
 *  risk_analyst     → lihat data risiko, jalankan simulasi
 *  auditor          → read-only, ekspor laporan
 *
 * Penggunaan:
 *   router.delete('/x', authenticate, requireRole('admin'), ctrl.hapus)
 *   router.post('/y',   authenticate, requireRole('finance_manager','admin'), ctrl.approve)
 */

const ROLE_HIERARCHY = {
  admin:            5,
  finance_manager:  4,
  treasury_officer: 3,
  risk_analyst:     2,
  auditor:          1,
};

/**
 * @param {...string} allowedRoles - daftar peran yang boleh mengakses route
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Tidak terautentikasi.',
      });
    }

    const { peran } = req.user;

    // Admin selalu diizinkan
    if (peran === 'admin') return next();

    if (!allowedRoles.includes(peran)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Peran yang dibutuhkan: ${allowedRoles.join(' / ')}.`,
        your_role: peran,
      });
    }

    next();
  };
}

/**
 * Cek apakah user memiliki hak akses spesifik dari hak_akses JSON.
 * Contoh: requirePermission('transaksi', 'approve')
 *
 * @param {string} resource  - key dari hak_akses JSON (misal: 'transaksi')
 * @param {string} action    - aksi yang dibutuhkan (misal: 'approve')
 */
function requirePermission(resource, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
    }

    // Admin bypass
    if (req.user.peran === 'admin') return next();

    const hak = req.user.hak_akses || {};
    const actions = hak[resource] || [];

    if (!actions.includes(action)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Hak akses '${action}' pada '${resource}' tidak dimiliki.`,
      });
    }

    next();
  };
}

module.exports = { requireRole, requirePermission };
