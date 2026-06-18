const { pool } = require('../config/database');
const { ok }   = require('../utils/response');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dashboard/summary
// Returns KPI data for the main dashboard
// ─────────────────────────────────────────────────────────────────────────────
async function summary(req, res, next) {
  try {
    // ── 1. Total exposure dalam USD ────────────────────────────────────────────
    const [[exposureRow]] = await pool.execute(
      `SELECT
         COALESCE(SUM(
           CASE mata_uang_asal
             WHEN 'USD' THEN jumlah_asal
             WHEN 'EUR' THEN jumlah_asal * 1.08
             WHEN 'GBP' THEN jumlah_asal * 1.27
             WHEN 'JPY' THEN jumlah_asal / 157
             WHEN 'SGD' THEN jumlah_asal / 1.34
             ELSE jumlah_tujuan / 16300
           END
         ), 0) AS total_exposure_usd
       FROM tb_transaksi_pembayaran
       WHERE status_pembayaran NOT IN ('failed','cancelled')`
    );

    // ── 2. High-risk transactions count ───────────────────────────────────────
    const [[riskRow]] = await pool.execute(
      `SELECT COUNT(*) AS high_risk_count
       FROM tb_analisis_risiko
       WHERE level_risiko = 'tinggi'
         AND timestamp_analisis >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    // ── 3. Hedging coverage % ─────────────────────────────────────────────────
    const [[hedgingRow]] = await pool.execute(
      `SELECT
         COALESCE(SUM(nilai_kontrak), 0)                 AS total_hedged,
         (SELECT COALESCE(SUM(jumlah_asal), 0)
          FROM tb_transaksi_pembayaran
          WHERE status_pembayaran IN ('pending','processing')
         )                                               AS total_exposure_raw
       FROM tb_hedging
       WHERE status_hedging = 'aktif'`
    );

    const coverage = hedgingRow.total_exposure_raw > 0
      ? Math.round((hedgingRow.total_hedged / hedgingRow.total_exposure_raw) * 100)
      : 0;

    // ── 4. Pending approvals ──────────────────────────────────────────────────
    const [[pendingRow]] = await pool.execute(
      `SELECT COUNT(*) AS pending_approvals_count
       FROM tb_transaksi_pembayaran
       WHERE status_pembayaran = 'pending'`
    );

    // ── 5. Recent unread alerts (5 latest) ────────────────────────────────────
    const [recentAlerts] = await pool.execute(
      `SELECT p.id_peringatan, p.jenis_peringatan, p.level_keparahan,
              p.pesan_peringatan, p.timestamp_peringatan, p.is_dibaca,
              t.nomor_referensi
       FROM tb_peringatan_risiko p
       LEFT JOIN tb_analisis_risiko a ON a.id_analisis = p.id_analisis
       LEFT JOIN tb_transaksi_pembayaran t ON t.id_transaksi = a.id_transaksi
       WHERE p.id_pengguna = ?
       ORDER BY p.timestamp_peringatan DESC
       LIMIT 5`,
      [req.user.id]
    );

    // ── 6. Transaction stats (30d) ────────────────────────────────────────────
    const [txStats] = await pool.execute(
      `SELECT
         status_pembayaran,
         COUNT(*)           AS jumlah,
         SUM(jumlah_asal)   AS total_nilai
       FROM tb_transaksi_pembayaran
       WHERE tanggal_transaksi >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY status_pembayaran`
    );

    // ── 7. Top 5 currencies by volume ─────────────────────────────────────────
    const [topCurrencies] = await pool.execute(
      `SELECT mata_uang_asal, COUNT(*) AS jumlah_transaksi, SUM(jumlah_asal) AS total_volume
       FROM tb_transaksi_pembayaran
       WHERE tanggal_transaksi >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY mata_uang_asal
       ORDER BY total_volume DESC
       LIMIT 5`
    );

    return ok(res, {
      total_exposure_usd:        Math.round(parseFloat(exposureRow.total_exposure_usd)),
      high_risk_count:           parseInt(riskRow.high_risk_count, 10),
      hedging_coverage_pct:      Math.min(100, coverage),
      pending_approvals_count:   parseInt(pendingRow.pending_approvals_count, 10),
      recent_alerts:             recentAlerts,
      transaction_stats_30d:     txStats,
      top_currencies_30d:        topCurrencies,
    });
  } catch (err) { next(err); }
}

module.exports = { summary };
