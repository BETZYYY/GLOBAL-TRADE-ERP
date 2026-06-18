const { pool }       = require('../config/database');
const { writeAudit } = require('../utils/audit');
const { ok, notFound } = require('../utils/response');

const ip = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/alerts  –  unread alerts for current user
// ─────────────────────────────────────────────────────────────────────────────
async function list(req, res, next) {
  try {
    const { semua = 'false', page = 1, limit = 20 } = req.query;
    const showAll = semua === 'true';

    const where = showAll
      ? 'p.id_pengguna = ?'
      : 'p.id_pengguna = ? AND p.is_dibaca = FALSE';

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM tb_peringatan_risiko p WHERE ${where}`,
      [req.user.id]
    );

    const [rows] = await pool.query(
      `SELECT p.*,
              a.id_transaksi, a.skor_volatilitas, a.tipe_risiko,
              t.nomor_referensi
       FROM tb_peringatan_risiko p
       LEFT JOIN tb_analisis_risiko a ON a.id_analisis = p.id_analisis
       LEFT JOIN tb_transaksi_pembayaran t ON t.id_transaksi = a.id_transaksi
       WHERE ${where}
       ORDER BY p.timestamp_peringatan DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit, 10), (parseInt(page, 10) - 1) * parseInt(limit, 10)]
    );

    return ok(res, rows, 'Berhasil', 200,
      { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (err) { next(err); }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/alerts/:id/read  –  mark as read
// ─────────────────────────────────────────────────────────────────────────────
async function markRead(req, res, next) {
  try {
    const [[alert]] = await pool.execute(
      'SELECT * FROM tb_peringatan_risiko WHERE id_peringatan = ? AND id_pengguna = ?',
      [req.params.id, req.user.id]
    );
    if (!alert) return notFound(res, 'Peringatan');

    await pool.execute(
      'UPDATE tb_peringatan_risiko SET is_dibaca = TRUE WHERE id_peringatan = ?',
      [req.params.id]
    );

    await writeAudit({
      id_pengguna: req.user.id, jenis_aksi: 'UPDATE',
      tabel_terdampak: 'tb_peringatan_risiko', id_record: req.params.id,
      data_sesudah: { is_dibaca: true }, ip_address: ip(req), status_aksi: 'sukses',
    });

    return ok(res, { id_peringatan: req.params.id, is_dibaca: true },
      'Peringatan ditandai sudah dibaca.');
  } catch (err) { next(err); }
}

module.exports = { list, markRead };
