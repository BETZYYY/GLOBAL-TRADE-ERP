const crypto       = require('crypto');
const { pool }     = require('../config/database');
const { writeAudit } = require('../utils/audit');
const { ok, created, fail, notFound, paginate } = require('../utils/response');

const ip = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

// ── Auto-generate nomor referensi ─────────────────────────────────────────────
async function generateRef() {
  const prefix = 'TRX';
  const year   = new Date().getFullYear();
  const [[{ cnt }]] = await pool.execute(
    `SELECT COUNT(*) AS cnt FROM tb_transaksi_pembayaran
     WHERE YEAR(tanggal_transaksi) = ?`, [year]
  );
  const seq = String(cnt + 1).padStart(5, '0');
  return `${prefix}-${year}-${seq}`;
}

// ── GET /api/transactions ─────────────────────────────────────────────────────
async function list(req, res, next) {
  try {
    const {
      status, mata_uang_asal, from_date, to_date,
      page = 1, limit = 20,
    } = req.query;

    let where = '1=1';
    const args = [];

    if (status)        { where += ' AND t.status_pembayaran = ?';    args.push(status); }
    if (mata_uang_asal){ where += ' AND t.mata_uang_asal = ?';       args.push(mata_uang_asal); }
    if (from_date)     { where += ' AND DATE(t.tanggal_transaksi) >= ?'; args.push(from_date); }
    if (to_date)       { where += ' AND DATE(t.tanggal_transaksi) <= ?'; args.push(to_date); }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM tb_transaksi_pembayaran t WHERE ${where}`, args
    );

    // Gunakan query() bukan execute() karena correlated subquery
    // tidak compatible dengan prepared statements
    const escapedArgs  = args.map(a => pool.pool?.escape?.(a) ?? `'${String(a).replace(/'/g,"''")}'`);
    // Build safe WHERE: pakai parameterized via query format
    const [rows] = await pool.query(
      `SELECT t.*,
              p.nama_lengkap AS nama_pengguna, p.peran,
              (SELECT a.level_risiko FROM tb_analisis_risiko a
               WHERE a.id_transaksi = t.id_transaksi
               ORDER BY a.timestamp_analisis DESC LIMIT 1) AS level_risiko,
              (SELECT a.skor_volatilitas FROM tb_analisis_risiko a
               WHERE a.id_transaksi = t.id_transaksi
               ORDER BY a.timestamp_analisis DESC LIMIT 1) AS skor_volatilitas
       FROM tb_transaksi_pembayaran t
       LEFT JOIN tb_pengguna p ON p.id_pengguna = t.id_pengguna
       WHERE ${where}
       ORDER BY t.tanggal_transaksi DESC
       LIMIT ? OFFSET ?`,
      [...args, parseInt(limit, 10), offset]
    );

    await writeAudit({
      id_pengguna: req.user.id, jenis_aksi: 'READ',
      tabel_terdampak: 'tb_transaksi_pembayaran',
      ip_address: ip(req), status_aksi: 'sukses',
    });

    return ok(res, rows, 'Success', 200, paginate(page, limit, total));
  } catch (err) { next(err); }
}

// ── GET /api/transactions/:id ─────────────────────────────────────────────────
async function getOne(req, res, next) {
  try {
    const [[trx]] = await pool.execute(
      `SELECT t.*, p.nama_lengkap AS nama_pengguna, p.email, p.peran,
              k.kurs_beli, k.kurs_jual, k.sumber_api
       FROM tb_transaksi_pembayaran t
       LEFT JOIN tb_pengguna p ON p.id_pengguna = t.id_pengguna
       LEFT JOIN tb_nilai_tukar k ON k.id_kurs = t.id_kurs
       WHERE t.id_transaksi = ?`, [req.params.id]
    );

    if (!trx) return notFound(res, 'Transaksi');

    const [analisis] = await pool.execute(
      `SELECT * FROM tb_analisis_risiko WHERE id_transaksi = ?
       ORDER BY timestamp_analisis DESC LIMIT 5`,
      [req.params.id]
    );

    const [hedging] = await pool.execute(
      `SELECT * FROM tb_hedging WHERE id_transaksi = ?`, [req.params.id]
    );

    await writeAudit({
      id_pengguna: req.user.id, jenis_aksi: 'READ',
      tabel_terdampak: 'tb_transaksi_pembayaran',
      id_record: req.params.id, ip_address: ip(req), status_aksi: 'sukses',
    });

    return ok(res, { ...trx, analisis_risiko: analisis, hedging });
  } catch (err) { next(err); }
}

// ── POST /api/transactions ────────────────────────────────────────────────────
async function create(req, res, next) {
  try {
    const {
      id_kurs, mata_uang_asal, mata_uang_tujuan,
      jumlah_asal, nilai_tukar_pakai, metode_pembayaran, catatan,
    } = req.body;

    if (!id_kurs || !mata_uang_asal || !mata_uang_tujuan || !jumlah_asal || !nilai_tukar_pakai) {
      return fail(res, 'Required fields: id_kurs, mata_uang_asal, mata_uang_tujuan, jumlah_asal, nilai_tukar_pakai');
    }

    const nomor_referensi = await generateRef();
    const id_transaksi    = crypto.randomUUID();
    const jumlah_tujuan   = parseFloat((parseFloat(jumlah_asal) * parseFloat(nilai_tukar_pakai)).toFixed(2));

    await pool.execute(
      `INSERT INTO tb_transaksi_pembayaran
         (id_transaksi, nomor_referensi, id_pengguna, id_kurs,
          mata_uang_asal, mata_uang_tujuan, jumlah_asal, jumlah_tujuan,
          nilai_tukar_pakai, metode_pembayaran, status_pembayaran, tanggal_transaksi, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), ?)`,
      [id_transaksi, nomor_referensi, req.user.id, id_kurs,
       mata_uang_asal, mata_uang_tujuan, jumlah_asal, jumlah_tujuan,
       nilai_tukar_pakai, metode_pembayaran || null, catatan || null]
    );

    const [[trx]] = await pool.execute(
      'SELECT * FROM tb_transaksi_pembayaran WHERE id_transaksi = ?', [id_transaksi]
    );

    await writeAudit({
      id_pengguna: req.user.id, jenis_aksi: 'CREATE',
      tabel_terdampak: 'tb_transaksi_pembayaran', id_record: id_transaksi,
      data_sesudah: { nomor_referensi, jumlah_asal, mata_uang_asal },
      ip_address: ip(req), status_aksi: 'sukses',
    });

    return created(res, trx, `Transaction ${nomor_referensi} created successfully.`);
  } catch (err) { next(err); }
}

// ── PATCH /api/transactions/:id/approve ──────────────────────────────────────
async function approve(req, res, next) {
  try {
    const [[trx]] = await pool.execute(
      'SELECT * FROM tb_transaksi_pembayaran WHERE id_transaksi = ?', [req.params.id]
    );
    if (!trx) return notFound(res, 'Transaksi');

    if (!['pending', 'processing'].includes(trx.status_pembayaran)) {
      return fail(res, `Transaksi dengan status '${trx.status_pembayaran}' tidak dapat disetujui.`, 409);
    }

    await pool.execute(
      `UPDATE tb_transaksi_pembayaran
       SET status_pembayaran = 'completed'
       WHERE id_transaksi = ?`, [req.params.id]
    );

    await writeAudit({
      id_pengguna: req.user.id, jenis_aksi: 'UPDATE',
      tabel_terdampak: 'tb_transaksi_pembayaran', id_record: req.params.id,
      data_sebelum: { status_pembayaran: trx.status_pembayaran },
      data_sesudah:  { status_pembayaran: 'completed' },
      ip_address: ip(req), status_aksi: 'sukses',
    });

    return ok(res, { id_transaksi: req.params.id, status_pembayaran: 'completed' },
      `Transaction ${trx.nomor_referensi} approved successfully.`);
  } catch (err) { next(err); }
}

// ── PATCH /api/transactions/:id/reject ───────────────────────────────────────
async function reject(req, res, next) {
  try {
    const { alasan } = req.body;
    if (!alasan) return fail(res, 'Rejection reason is required.');

    const [[trx]] = await pool.execute(
      'SELECT * FROM tb_transaksi_pembayaran WHERE id_transaksi = ?', [req.params.id]
    );
    if (!trx) return notFound(res, 'Transaksi');

    if (trx.status_pembayaran === 'completed' || trx.status_pembayaran === 'cancelled') {
      return fail(res, `Transaksi dengan status '${trx.status_pembayaran}' tidak dapat ditolak.`, 409);
    }

    await pool.execute(
      `UPDATE tb_transaksi_pembayaran
       SET status_pembayaran = 'cancelled',
           catatan = CONCAT(COALESCE(catatan,''), '\n[DITOLAK] ', ?)
       WHERE id_transaksi = ?`,
      [alasan, req.params.id]
    );

    await writeAudit({
      id_pengguna: req.user.id, jenis_aksi: 'UPDATE',
      tabel_terdampak: 'tb_transaksi_pembayaran', id_record: req.params.id,
      data_sebelum: { status_pembayaran: trx.status_pembayaran },
      data_sesudah:  { status_pembayaran: 'cancelled', alasan },
      ip_address: ip(req), status_aksi: 'sukses',
    });

    return ok(res, { id_transaksi: req.params.id, status_pembayaran: 'cancelled' },
      `Transaksi ${trx.nomor_referensi} ditolak.`);
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, approve, reject };
