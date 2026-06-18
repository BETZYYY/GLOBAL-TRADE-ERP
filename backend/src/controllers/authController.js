const bcrypt              = require('bcryptjs');
const jwt                 = require('jsonwebtoken');
const crypto              = require('crypto');
const { pool }            = require('../config/database');
const { addToBlacklist }  = require('../config/tokenBlacklist');

const MAX_FAILED_ATTEMPTS = 5;

// ─── Helper: tulis ke audit trail ────────────────────────────────────────────
async function writeAudit(conn, { id_pengguna, jenis_aksi, tabel, id_record, ip_address, status_aksi, data_sesudah }) {
  try {
    await (conn || pool).execute(
      `INSERT INTO tb_audit_trail
         (id_pengguna, jenis_aksi, tabel_terdampak, id_record_terdampak,
          ip_address, status_aksi, data_sesudah)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id_pengguna, jenis_aksi, tabel,
        id_record || null,
        ip_address || null,
        status_aksi,
        data_sesudah ? JSON.stringify(data_sesudah) : null,
      ]
    );
  } catch (auditErr) {
    // Jangan sampai gagal audit merusak response utama
    console.error('[AUDIT ERROR]', auditErr.message);
  }
}

// ─── Helper: buat JWT token dengan JTI unik ──────────────────────────────────
function generateToken(user) {
  const jti = crypto.randomUUID();   // ID unik per-token (untuk blacklist)

  const token = jwt.sign(
    {
      id:        user.id_pengguna,
      email:     user.email,
      peran:     user.peran,
      hak_akses: typeof user.hak_akses === 'string'
                   ? JSON.parse(user.hak_akses)
                   : user.hak_akses,
      jti,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return { token, jti };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
    }

    // Ambil pengguna dari database
    const [[user]] = await pool.execute(
      `SELECT id_pengguna, nama_lengkap, email, password_hash,
              peran, hak_akses, status_akun, gagal_login
       FROM tb_pengguna
       WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    // ── Pengguna tidak ditemukan ──────────────────────────────────────────────
    if (!user) {
      // Tulis audit dengan id_pengguna dummy (tidak bisa FK karena user tidak ada)
      // Kita skip audit agar tidak error FK; cukup log di console
      console.warn(`[AUTH] Login gagal – email tidak ditemukan: ${email} | IP: ${ip}`);
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    // ── Akun dikunci / nonaktif ───────────────────────────────────────────────
    if (user.status_akun !== 'aktif') {
      await writeAudit(null, {
        id_pengguna: user.id_pengguna,
        jenis_aksi:  'LOGIN',
        tabel:       'tb_pengguna',
        id_record:   user.id_pengguna,
        ip_address:  ip,
        status_aksi: 'ditolak',
        data_sesudah: { alasan: `status_akun = ${user.status_akun}` },
      });

      return res.status(403).json({
        success: false,
        message:
          user.status_akun === 'ditangguhkan'
            ? 'Akun Anda telah ditangguhkan. Hubungi administrator.'
            : 'Akun Anda tidak aktif.',
      });
    }

    // ── Akun terkunci karena terlalu banyak gagal login ──────────────────────
    if (user.gagal_login >= MAX_FAILED_ATTEMPTS) {
      await writeAudit(null, {
        id_pengguna: user.id_pengguna,
        jenis_aksi:  'LOGIN',
        tabel:       'tb_pengguna',
        id_record:   user.id_pengguna,
        ip_address:  ip,
        status_aksi: 'ditolak',
        data_sesudah: { alasan: 'akun_dikunci_gagal_login', gagal_login: user.gagal_login },
      });

      return res.status(423).json({
        success: false,
        message: `Akun dikunci setelah ${MAX_FAILED_ATTEMPTS}x percobaan gagal. Hubungi administrator.`,
      });
    }

    // ── Verifikasi password ───────────────────────────────────────────────────
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      // Tambah hitungan gagal login
      const newCount = user.gagal_login + 1;
      await pool.execute(
        `UPDATE tb_pengguna
         SET gagal_login = ?,
             status_akun = IF(? >= ?, 'ditangguhkan', status_akun)
         WHERE id_pengguna = ?`,
        [newCount, newCount, MAX_FAILED_ATTEMPTS, user.id_pengguna]
      );

      await writeAudit(null, {
        id_pengguna: user.id_pengguna,
        jenis_aksi:  'LOGIN',
        tabel:       'tb_pengguna',
        id_record:   user.id_pengguna,
        ip_address:  ip,
        status_aksi: 'gagal',
        data_sesudah: { gagal_login: newCount },
      });

      const sisaPercobaan = MAX_FAILED_ATTEMPTS - newCount;
      return res.status(401).json({
        success: false,
        message:
          newCount >= MAX_FAILED_ATTEMPTS
            ? 'Akun telah dikunci karena terlalu banyak percobaan gagal.'
            : `Email atau password salah. Sisa percobaan: ${sisaPercobaan}x.`,
      });
    }

    // ── Login sukses ──────────────────────────────────────────────────────────
    // Reset gagal_login dan update last_login
    await pool.execute(
      `UPDATE tb_pengguna
       SET gagal_login = 0, last_login = NOW()
       WHERE id_pengguna = ?`,
      [user.id_pengguna]
    );

    const { token, jti } = generateToken(user);

    await writeAudit(null, {
      id_pengguna: user.id_pengguna,
      jenis_aksi:  'LOGIN',
      tabel:       'tb_pengguna',
      id_record:   user.id_pengguna,
      ip_address:  ip,
      status_aksi: 'sukses',
      data_sesudah: { jti, peran: user.peran },
    });

    return res.json({
      success: true,
      message: `Selamat datang, ${user.nama_lengkap}!`,
      data: {
        token,
        user: {
          id:        user.id_pengguna,
          nama:      user.nama_lengkap,
          email:     user.email,
          peran:     user.peran,
          hak_akses: typeof user.hak_akses === 'string'
                       ? JSON.parse(user.hak_akses)
                       : user.hak_akses,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
async function logout(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

  try {
    const { jti, exp, id } = req.user;

    // Masukkan token ke blacklist
    if (jti) addToBlacklist(jti, exp);

    await writeAudit(null, {
      id_pengguna: id,
      jenis_aksi:  'LOGOUT',
      tabel:       'tb_pengguna',
      id_record:   id,
      ip_address:  ip,
      status_aksi: 'sukses',
      data_sesudah: { jti },
    });

    return res.json({
      success: true,
      message: 'Logout berhasil.',
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
async function getMe(req, res, next) {
  try {
    const [[user]] = await pool.execute(
      `SELECT id_pengguna, nama_lengkap, email, peran,
              hak_akses, status_akun, tanggal_dibuat, last_login
       FROM tb_pengguna
       WHERE id_pengguna = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    return res.json({
      success: true,
      data: {
        id:             user.id_pengguna,
        nama:           user.nama_lengkap,
        email:          user.email,
        peran:          user.peran,
        hak_akses:      typeof user.hak_akses === 'string'
                          ? JSON.parse(user.hak_akses)
                          : user.hak_akses,
        status_akun:    user.status_akun,
        tanggal_dibuat: user.tanggal_dibuat,
        last_login:     user.last_login,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, getMe };
