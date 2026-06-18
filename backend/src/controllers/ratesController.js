const crypto        = require('crypto');
const axios         = require('axios');
const { pool }      = require('../config/database');
const { writeAudit } = require('../utils/audit');
const { ok, created, fail } = require('../utils/response');

const ip = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

const OER_KEY     = process.env.OPENEXCHANGERATES_KEY || process.env.OPEN_EXCHANGE_RATES_APP_ID || '';
const OER_BASE    = 'https://openexchangerates.org/api';
const TARGET_PAIRS = [
  ['USD','IDR'], ['EUR','IDR'], ['JPY','IDR'],
  ['GBP','IDR'], ['SGD','IDR'], ['AUD','IDR'], ['CNY','IDR'],
];

// ── GET /api/rates ─────────────────────────────────────────────────────────────
// Latest rate for each currency pair
async function latest(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT k1.*
       FROM tb_nilai_tukar k1
       INNER JOIN (
         SELECT kode_mata_uang_dari, kode_mata_uang_ke, MAX(timestamp_fetch) AS latest
         FROM tb_nilai_tukar
         GROUP BY kode_mata_uang_dari, kode_mata_uang_ke
       ) k2
       ON k1.kode_mata_uang_dari = k2.kode_mata_uang_dari
          AND k1.kode_mata_uang_ke = k2.kode_mata_uang_ke
          AND k1.timestamp_fetch   = k2.latest
       ORDER BY k1.kode_mata_uang_dari`
    );

    return ok(res, rows);
  } catch (err) { next(err); }
}

// ── GET /api/rates/history?pair=USD/IDR&days=30 ──────────────────────────────
async function history(req, res, next) {
  try {
    const { pair, days = 30 } = req.query;

    if (!pair) return fail(res, 'Query param "pair" is required, example: USD/IDR');

    const [dari, ke] = pair.split('/');
    if (!dari || !ke) return fail(res, 'Format pair salah. Gunakan format: USD/IDR');

    const [rows] = await pool.execute(
      `SELECT DATE(timestamp_fetch) AS tanggal,
              AVG(nilai_kurs)       AS avg_rate,
              MIN(nilai_kurs)       AS min_rate,
              MAX(nilai_kurs)       AS max_rate,
              AVG(kurs_beli)        AS avg_beli,
              AVG(kurs_jual)        AS avg_jual
       FROM tb_nilai_tukar
       WHERE kode_mata_uang_dari = ?
         AND kode_mata_uang_ke   = ?
         AND timestamp_fetch    >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(timestamp_fetch)
       ORDER BY tanggal ASC`,
      [dari, ke, parseInt(days, 10)]
    );

    return ok(res, { pair, days: +days, history: rows });
  } catch (err) { next(err); }
}

// ── POST /api/rates/fetch ──────────────────────────────────────────────────────
// Trigger manual pull from OpenExchangeRates and persist to DB
async function fetchFromAPI(req, res, next) {
  try {
    if (!OER_KEY) {
      return fail(res, 'OPENEXCHANGERATES_KEY belum dikonfigurasi di .env', 503);
    }

    const { data } = await axios.get(`${OER_BASE}/latest.json`, {
      params: { app_id: OER_KEY, base: 'USD' },
      timeout: 10_000,
    });

    const fetched = [];
    const now     = new Date().toISOString().slice(0, 19).replace('T', ' ');

    for (const [dari, ke] of TARGET_PAIRS) {
      const baseRate = data.rates[ke];
      if (!baseRate) continue;

      // Convert: if dari is not USD we pivot through USD
      let rate;
      if (dari === 'USD') {
        rate = baseRate;
      } else {
        const fromUSD = data.rates[dari];
        if (!fromUSD) continue;
        rate = baseRate / fromUSD;
      }

      const spread   = rate * 0.0025;         // 0.25% spread
      const kurs_beli = parseFloat((rate - spread).toFixed(6));
      const kurs_jual = parseFloat((rate + spread).toFixed(6));

      const id_kurs = crypto.randomUUID();

      await pool.execute(
        `INSERT INTO tb_nilai_tukar
           (id_kurs, kode_mata_uang_dari, kode_mata_uang_ke,
            nilai_kurs, kurs_beli, kurs_jual,
            sumber_api, timestamp_fetch, is_realtime)
         VALUES (?, ?, ?, ?, ?, ?, 'OpenExchangeRates', ?, TRUE)`,
        [id_kurs, dari, ke, parseFloat(rate.toFixed(6)), kurs_beli, kurs_jual, now]
      );

      fetched.push({ pair: `${dari}/${ke}`, nilai_kurs: rate, kurs_beli, kurs_jual });
    }

    await writeAudit({
      id_pengguna: req.user.id, jenis_aksi: 'CREATE',
      tabel_terdampak: 'tb_nilai_tukar',
      data_sesudah: { fetched: fetched.length, source: 'OpenExchangeRates' },
      ip_address: ip(req), status_aksi: 'sukses',
    });

    return created(res, fetched, `${fetched.length} exchange rates updated successfully.`);
  } catch (err) {
    if (err.response?.status === 401) {
      return fail(res, 'API key OpenExchangeRates tidak valid.', 401);
    }
    next(err);
  }
}

module.exports = { latest, history, fetchFromAPI };
