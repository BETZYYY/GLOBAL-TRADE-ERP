const crypto         = require('crypto');
const { pool }       = require('../config/database');
const { writeAudit } = require('../utils/audit');
const { ok, created, fail, notFound } = require('../utils/response');

const ip = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/hedging  –  active positions with estimated P&L
// ─────────────────────────────────────────────────────────────────────────────
async function list(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let where = '1=1';
    const args = [];
    if (status) { where += ' AND h.status_hedging = ?'; args.push(status); }

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM tb_hedging h WHERE ${where}`, args
    );

    const [rows] = await pool.query(
      `SELECT h.*,
              t.nomor_referensi, t.mata_uang_asal, t.mata_uang_tujuan,
              t.jumlah_asal, t.status_pembayaran,
              k.nilai_kurs AS kurs_saat_ini,
              ROUND((h.nilai_tukar_terkunci - k.nilai_kurs) * h.nilai_kontrak, 2) AS estimasi_pnl
       FROM tb_hedging h
       LEFT JOIN tb_transaksi_pembayaran t ON t.id_transaksi = h.id_transaksi
       LEFT JOIN tb_nilai_tukar k ON
         k.kode_mata_uang_dari = h.mata_uang_lindung
         AND k.kode_mata_uang_ke = 'IDR'
         AND k.timestamp_fetch = (
           SELECT MAX(timestamp_fetch) FROM tb_nilai_tukar
           WHERE kode_mata_uang_dari = h.mata_uang_lindung AND kode_mata_uang_ke = 'IDR'
         )
       WHERE ${where}
       ORDER BY h.tanggal_jatuh_tempo ASC
       LIMIT ? OFFSET ?`,
      [...args, parseInt(limit, 10), (parseInt(page, 10) - 1) * parseInt(limit, 10)]
    );

    return ok(res, rows, 'Success', 200,
      { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (err) { next(err); }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/hedging  –  create hedging position
// ─────────────────────────────────────────────────────────────────────────────
async function create(req, res, next) {
  try {
    const {
      id_transaksi, tipe_hedging, nilai_kontrak,
      mata_uang_lindung, nilai_tukar_terkunci,
      tanggal_mulai, tanggal_jatuh_tempo,
      biaya_premium = 0, lembaga_keuangan,
    } = req.body;

    const required = ['id_transaksi','tipe_hedging','nilai_kontrak', 'mata_uang_lindung'];
    const missing  = required.filter(f => req.body[f] == null);
    if (missing.length) return fail(res, `Required fields: ${missing.join(', ')}`);

    const [[trx]] = await pool.execute(
      'SELECT id_transaksi, nomor_referensi FROM tb_transaksi_pembayaran WHERE id_transaksi = ?',
      [id_transaksi]
    );
    if (!trx) return notFound(res, 'Transaksi');

    const id_hedging = crypto.randomUUID();
    await pool.execute(
      `INSERT INTO tb_hedging
         (id_hedging, id_transaksi, tipe_hedging, nilai_kontrak,
          mata_uang_lindung, nilai_tukar_terkunci,
          tanggal_mulai, tanggal_jatuh_tempo,
          biaya_premium, status_hedging, lembaga_keuangan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?)`,
      [id_hedging, id_transaksi, tipe_hedging, nilai_kontrak,
       mata_uang_lindung, 
       nilai_tukar_terkunci || 15820,
       tanggal_mulai || new Date().toISOString().split('T')[0],
       tanggal_jatuh_tempo || new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
       biaya_premium || 0, 
       lembaga_keuangan || 'Bank Mandiri']
    );

    const [[hedging]] = await pool.execute(
      'SELECT * FROM tb_hedging WHERE id_hedging = ?', [id_hedging]
    );

    await writeAudit({
      id_pengguna: req.user.id, jenis_aksi: 'CREATE',
      tabel_terdampak: 'tb_hedging', id_record: id_hedging,
      data_sesudah: { tipe_hedging, nilai_kontrak, mata_uang_lindung },
      ip_address: ip(req), status_aksi: 'sukses',
    });

    return created(res, hedging, `Hedging position ${tipe_hedging.toUpperCase()} created successfully.`);
  } catch (err) { next(err); }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/hedging/recommend?id_transaksi=...
// Logic: tenor>7d → forward; exposure>500M IDR → option; else → swap
// ─────────────────────────────────────────────────────────────────────────────
async function recommend(req, res, next) {
  try {
    const { id_transaksi } = req.query;
    if (!id_transaksi) return fail(res, 'Query param id_transaksi is required.');

    const [[trx]] = await pool.execute(
      `SELECT t.*, k.nilai_kurs FROM tb_transaksi_pembayaran t
       LEFT JOIN tb_nilai_tukar k ON k.id_kurs = t.id_kurs
       WHERE t.id_transaksi = ?`, [id_transaksi]
    );
    if (!trx) return notFound(res, 'Transaksi');

    const daysToSettle = Math.max(0,
      Math.round((Date.now() - new Date(trx.tanggal_transaksi).getTime()) / 86_400_000)
    );
    const idrExposure = parseFloat(trx.jumlah_tujuan || 0);

    // Decision logic
    let instrument, alasan;
    if (daysToSettle > 7) {
      instrument = 'forward';
      alasan     = `Tenor ${daysToSettle} hari melebihi 7 hari → Forward contract untuk mengunci kurs.`;
    } else if (idrExposure > 500_000_000) {
      instrument = 'option';
      alasan     = `Eksposur IDR ${idrExposure.toLocaleString('id')} melebihi 500 juta → Option memberikan proteksi fleksibel.`;
    } else {
      instrument = 'swap';
      alasan     = `Eksposur dan tenor rendah → Currency swap cukup efisien.`;
    }

    // Estimasi biaya premium (rough)
    const premium_estimate = idrExposure * (instrument === 'option' ? 0.015 : 0.005);

    return ok(res, {
      id_transaksi,
      nomor_referensi: trx.nomor_referensi,
      rekomendasi: instrument,
      alasan,
      parameter: { daysToSettle, idrExposure },
      estimasi_premium: Math.round(premium_estimate),
    }, `Rekomendasi instrumen hedging: ${instrument.toUpperCase()}`);
  } catch (err) { next(err); }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/hedging/recommend
// Simple recommendation logic for the frontend
// ─────────────────────────────────────────────────────────────────────────────
async function postRecommend(req, res, next) {
  const { currency_pair, exposure_amount, target_date, risk_tolerance } = req.body;
  try {
    const days = target_date ? 
      Math.ceil((new Date(target_date) - new Date()) / (1000 * 60 * 60 * 24)) : 90;
    
    let instrument = 'forward';
    let effectiveness = 91.5;
    let cost_pct = 1.0;

    if (risk_tolerance > 0.7) {
      instrument = 'option';
      effectiveness = 88.0;
      cost_pct = 1.3;
    } else if (days < 30) {
      instrument = 'swap';
      effectiveness = 79.0;
      cost_pct = 0.7;
    }

    const cost = exposure_amount * (cost_pct / 100);

    return ok(res, {
      instrument,
      hedged_amount: exposure_amount,
      forward_rate: 15820.50,
      est_cost: cost,
      cost_pct,
      effectiveness,
      tenor_days: days,
      confidence: 'HIGH'
    });
  } catch (err) { next(err); }
}

module.exports = { list, create, recommend, postRecommend };
