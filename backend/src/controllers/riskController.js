const crypto         = require('crypto');
const { pool }       = require('../config/database');
const { writeAudit } = require('../utils/audit');
const { ok, created, fail, notFound } = require('../utils/response');

const ip = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

// ─── Weights ──────────────────────────────────────────────────────────────────
const W = { VOLATILITY: 0.35, EXPOSURE: 0.30, TENOR: 0.20, LIQUIDITY: 0.15 };

// ─── Liquidity scores per currency ────────────────────────────────────────────
const LIQUIDITY_SCORE = { USD: 10, EUR: 15, GBP: 20, JPY: 25 };

// ─── Standard deviation helper ───────────────────────────────────────────────
function stdDev(values) {
  if (!values.length) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// ─── Exposure score (IDR) ─────────────────────────────────────────────────────
function exposureScore(idrAmount) {
  if      (idrAmount <  100_000_000)  return 10;   // < 100 juta
  else if (idrAmount <  500_000_000)  return 35;   // < 500 juta
  else if (idrAmount < 2_000_000_000) return 65;   // < 2 miliar
  else                                return 90;   // ≥ 2 miliar
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/risk/calculate
// ─────────────────────────────────────────────────────────────────────────────
async function calculate(req, res, next) {
  try {
    const { id_transaksi } = req.body;
    if (!id_transaksi) return fail(res, 'id_transaksi is required.');

    // Ambil data transaksi
    const [[trx]] = await pool.execute(
      `SELECT t.*, k.nilai_kurs, k.kode_mata_uang_dari, k.kode_mata_uang_ke
       FROM tb_transaksi_pembayaran t
       LEFT JOIN tb_nilai_tukar k ON k.id_kurs = t.id_kurs
       WHERE t.id_transaksi = ?`,
      [id_transaksi]
    );

    if (!trx) return notFound(res, 'Transaksi');

    // ── 1. Volatility Score ───────────────────────────────────────────────────
    // Ambil 30 data kurs historis untuk pair ini
    const [historicalRates] = await pool.execute(
      `SELECT nilai_kurs FROM tb_nilai_tukar
       WHERE kode_mata_uang_dari = ? AND kode_mata_uang_ke = ?
       ORDER BY timestamp_fetch DESC LIMIT 30`,
      [trx.mata_uang_asal, trx.mata_uang_tujuan]
    );

    let volScore = 30; // default jika data tidak cukup
    if (historicalRates.length >= 2) {
      const rates  = historicalRates.map(r => parseFloat(r.nilai_kurs));
      const avg    = rates.reduce((a, b) => a + b, 0) / rates.length;
      const sd     = stdDev(rates);
      const relVol = avg > 0 ? (sd / avg) * 100 : 0;
      volScore     = Math.min(100, relVol * 20);
    }

    // ── 2. Exposure Score (IDR) ───────────────────────────────────────────────
    const idrAmount  = parseFloat(trx.jumlah_tujuan || trx.jumlah_asal * (trx.nilai_kurs || 16000));
    const expScore   = exposureScore(idrAmount);

    // ── 3. Tenor Score ────────────────────────────────────────────────────────
    // Hitung hari sejak tanggal transaksi
    const daysSince = Math.max(0,
      Math.round((Date.now() - new Date(trx.tanggal_transaksi).getTime()) / 86_400_000)
    );
    const tenorScore = Math.min(100, daysSince * 2);

    // ── 4. Liquidity Score ────────────────────────────────────────────────────
    const liqScore = LIQUIDITY_SCORE[trx.mata_uang_asal] ?? 40;

    // ── 5. Weighted Total ─────────────────────────────────────────────────────
    const rawScore = (
      volScore   * W.VOLATILITY  +
      expScore   * W.EXPOSURE    +
      tenorScore * W.TENOR       +
      liqScore   * W.LIQUIDITY
    );
    const skor_volatilitas = Math.round(Math.max(0, Math.min(100, rawScore)));

    const level_risiko =
      skor_volatilitas >= 70 ? 'tinggi' :
      skor_volatilitas >= 40 ? 'sedang' : 'rendah';

    const selisih_potensi_rugi = skor_volatilitas > 0
      ? parseFloat((idrAmount * (skor_volatilitas / 100) * 0.05).toFixed(2))
      : null;

    const parameter_simulasi = {
      weights: W,
      scores:  { volScore, expScore, tenorScore, liqScore },
      idrAmount,
      daysSince,
      historyPoints: historicalRates.length,
    };

    const rekomendasi = level_risiko === 'tinggi'
      ? 'Hedging required. Escalate to Finance Manager for special approval.'
      : level_risiko === 'sedang'
      ? 'Disarankan hedging parsial. Monitor pergerakan kurs secara berkala.'
      : 'Risiko rendah. Tidak diperlukan tindakan khusus.';

    // ── Simpan ke tb_analisis_risiko ──────────────────────────────────────────
    const id_analisis = crypto.randomUUID();
    await pool.execute(
      `INSERT INTO tb_analisis_risiko
         (id_analisis, id_transaksi, id_analyst, tipe_risiko,
          skor_volatilitas, level_risiko, selisih_potensi_rugi_usd,
          parameter_simulasi, rekomendasi)
       VALUES (?, ?, ?, 'volatilitas', ?, ?, ?, ?, ?)`,
      [id_analisis, id_transaksi, req.user.id,
       skor_volatilitas, level_risiko, selisih_potensi_rugi,
       JSON.stringify(parameter_simulasi), rekomendasi]
    );

    // ── Auto-create alert jika risiko tinggi ──────────────────────────────────
    if (level_risiko === 'tinggi') {
      const id_peringatan  = crypto.randomUUID();
      const level_keparahan = skor_volatilitas >= 85 ? 'emergency' : 'critical';
      const pesan_peringatan = `⚠️ HIGH risk detected on transaction ${trx.nomor_referensi}. Score: ${skor_volatilitas}/100. ${rekomendasi}`;

      await pool.execute(
        `INSERT INTO tb_peringatan_risiko
           (id_peringatan, id_analisis, id_pengguna, jenis_peringatan,
            level_keparahan, pesan_peringatan, threshold_terlampaui, is_dibaca)
         VALUES (?, ?, ?, 'volatilitas_tinggi', ?, ?, ?, FALSE)`,
        [
          id_peringatan, id_analisis, req.user.id,
          level_keparahan,
          pesan_peringatan,
          selisih_potensi_rugi,
        ]
      );

      // Emit real-time alert via WebSocket
      try {
        const { getIo } = require('../lib/socket');
        getIo().emit('new_alert', {
          id_peringatan,
          id_analisis,
          id_pengguna: req.user.id,
          jenis_peringatan: 'volatilitas_tinggi',
          level_keparahan,
          pesan_peringatan,
          threshold_terlampaui: selisih_potensi_rugi,
          is_dibaca: 0,
          tanggal_dibuat: new Date().toISOString()
        });
      } catch (e) {
        console.error('Socket emit error:', e.message);
      }
    }

    await writeAudit({
      id_pengguna: req.user.id, jenis_aksi: 'CREATE',
      tabel_terdampak: 'tb_analisis_risiko', id_record: id_analisis,
      data_sesudah: { skor_volatilitas, level_risiko, id_transaksi },
      ip_address: ip(req), status_aksi: 'sukses',
    });

    return created(res, {
      id_analisis,
      id_transaksi,
      nomor_referensi: trx.nomor_referensi,
      skor_volatilitas,
      level_risiko,
      selisih_potensi_rugi_usd: selisih_potensi_rugi,
      rekomendasi,
      breakdown: parameter_simulasi.scores,
      alert_dibuat: level_risiko === 'tinggi',
    }, 'Risk analysis calculated successfully.');
  } catch (err) { next(err); }
}

module.exports = { calculate };
