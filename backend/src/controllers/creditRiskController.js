const { ok, fail } = require('../utils/response');

// ─── Country risk weights (0–40; lower = safer) ───────────────────────────────
const COUNTRY_RISK = {
  SG: 5,  AU: 7,  JP: 8,  DE: 8,  GB: 9,  US: 9,   NL: 9,
  MY: 15, TH: 16, VN: 20, PH: 22, IN: 18, CN: 20, HK: 10,
  ID: 18, BR: 30, AR: 38, NG: 35, ZA: 28,
  DEFAULT: 25,
};

// ─── Sector risk weights ──────────────────────────────────────────────────────
const SECTOR_RISK = {
  teknologi: 10, perbankan: 12, manufaktur: 15, ritel: 18,
  energi: 20, properti: 22, pertambangan: 25, agribisnis: 18,
  DEFAULT: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/credit-risk/score
// ─────────────────────────────────────────────────────────────────────────────
async function score(req, res, next) {
  try {
    const {
      nama_perusahaan,
      negara,
      sektor,
      histori_pembayaran,   // 0–100 (100 = selalu tepat waktu)
      volume_transaksi,     // jumlah IDR
      laporan_keuangan,     // { debt_ratio, current_ratio, profit_margin }
    } = req.body;

    if (!nama_perusahaan || !negara || histori_pembayaran == null) {
      return fail(res, 'nama_perusahaan, negara, histori_pembayaran wajib diisi.');
    }

    // ── 1. Payment history score (0–40 pts) ──────────────────────────────────
    const paymentScore = Math.min(40, (parseFloat(histori_pembayaran) / 100) * 40);

    // ── 2. Country risk score (0–20 pts, inversed) ───────────────────────────
    const countryRisk  = COUNTRY_RISK[negara?.toUpperCase()] ?? COUNTRY_RISK.DEFAULT;
    const countryScore = Math.max(0, 20 - (countryRisk / 40) * 20);

    // ── 3. Sector risk score (0–15 pts, inversed) ────────────────────────────
    const sectorRisk   = SECTOR_RISK[sektor?.toLowerCase()] ?? SECTOR_RISK.DEFAULT;
    const sectorScore  = Math.max(0, 15 - (sectorRisk / 25) * 15);

    // ── 4. Volume score (0–15 pts: bigger = more trusted if history good) ────
    const volIDR      = parseFloat(volume_transaksi || 0);
    const volScore    = Math.min(15, Math.log10(Math.max(1, volIDR / 1_000_000)) * 3);

    // ── 5. Financial ratios (0–10 pts) ───────────────────────────────────────
    let finScore = 5; // default neutral
    if (laporan_keuangan) {
      const { debt_ratio = 0.5, current_ratio = 1, profit_margin = 0.05 } = laporan_keuangan;
      const debtPts    = Math.max(0, (1 - parseFloat(debt_ratio))  * 4);
      const liquidPts  = Math.min(3, parseFloat(current_ratio)  * 1.5);
      const profitPts  = Math.min(3, parseFloat(profit_margin)  * 30);
      finScore = Math.min(10, debtPts + liquidPts + profitPts);
    }

    // ── Aggregate ─────────────────────────────────────────────────────────────
    const rawSkor = paymentScore + countryScore + sectorScore + volScore + finScore;
    const skor    = Math.round(Math.min(100, Math.max(0, rawSkor)));

    const klasifikasi =
      skor >= 80 ? 'AAA' :
      skor >= 70 ? 'AA'  :
      skor >= 60 ? 'A'   :
      skor >= 50 ? 'BBB' :
      skor >= 40 ? 'BB'  :
      skor >= 30 ? 'B'   : 'CCC';

    // Batas kredit berbasis skor (IDR)
    const batas_kredit =
      skor >= 80 ? 10_000_000_000 :
      skor >= 70 ?  5_000_000_000 :
      skor >= 60 ?  2_000_000_000 :
      skor >= 50 ?  1_000_000_000 :
      skor >= 40 ?    500_000_000 :
                      100_000_000;

    const faktor_risiko = [];
    if (histori_pembayaran < 70) faktor_risiko.push('Histori pembayaran di bawah rata-rata.');
    if (countryRisk > 20)        faktor_risiko.push(`Risiko negara ${negara} tergolong tinggi.`);
    if (sectorRisk > 20)         faktor_risiko.push(`Sektor ${sektor} memiliki risiko lebih tinggi.`);
    if (laporan_keuangan?.debt_ratio > 0.7) faktor_risiko.push('Rasio utang di atas 70% – perhatikan kapasitas bayar.');

    return ok(res, {
      nama_perusahaan,
      skor,
      klasifikasi,
      batas_kredit,
      batas_kredit_display: `IDR ${batas_kredit.toLocaleString('id')}`,
      faktor_risiko: faktor_risiko.length ? faktor_risiko : ['Tidak ada faktor risiko signifikan.'],
      breakdown: {
        payment_history:  Math.round(paymentScore * 10) / 10,
        country_risk:     Math.round(countryScore  * 10) / 10,
        sector_risk:      Math.round(sectorScore   * 10) / 10,
        volume:           Math.round(volScore       * 10) / 10,
        financial_ratios: Math.round(finScore       * 10) / 10,
      },
    }, 'Credit score berhasil dihitung.');
  } catch (err) { next(err); }
}

module.exports = { score };
