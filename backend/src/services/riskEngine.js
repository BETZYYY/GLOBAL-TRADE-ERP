/**
 * Risk Engine – calculateRiskScore
 *
 * Produces a deterministic score in [0, 100] and a categorical level
 * (LOW | MEDIUM | HIGH | CRITICAL) from a set of transaction attributes.
 *
 * Factors and max weights
 * ────────────────────────────────────────────────────────────────────────
 *  Factor                        Weight   Notes
 *  ─────────────────────────────────────────────────────────────────────
 *  Amount vs. exposure limit       30      > 80 % of limit → max weight
 *  Currency volatility             20      Emerging-market pairs score higher
 *  Counterparty credit rating      25      AAA → 0 pts, D → 25 pts
 *  Settlement method               10      CRYPTO > SWIFT > SEPA
 *  Days to value date              15      Longer tenor → higher risk
 * ─────────────────────────────────────────────────────────────────────
 *  Total                          100
 */

/** Annualised volatility lookup (simplified; real impl would use live data) */
const CURRENCY_VOLATILITY = {
  'USD/IDR': 0.72,
  'EUR/IDR': 0.68,
  'SGD/IDR': 0.55,
  'JPY/IDR': 0.61,
  'CNY/IDR': 0.65,
  'GBP/IDR': 0.70,
  'AUD/IDR': 0.66,
  'DEFAULT':  0.50,
};

/** Credit-rating → numeric default-risk score (0 = safest, 25 = riskiest) */
const CREDIT_RATING_SCORE = {
  AAA: 0,  AA:  2,  'A+': 4,  A:   6,  'A-': 7,
  'BBB+': 9, BBB: 11, 'BBB-': 13,
  'BB+': 16, BB: 18, 'BB-': 20,
  'B+': 21,  B:  22, 'B-': 23,
  CCC: 24, CC: 24, C: 25, D: 25,
  UNRATED: 18,  // treat unknown as sub-investment grade
};

const SETTLEMENT_SCORE = { CRYPTO: 10, SWIFT: 5, SEPA: 2, LOCAL: 3, RTGS: 1 };

/**
 * @param {object} params
 * @param {number}  params.amount          - Transaction amount (foreign currency)
 * @param {number}  params.exposureLimit   - Counterparty exposure limit (same currency)
 * @param {string}  params.currencyPair    - e.g. 'USD/IDR'
 * @param {string}  params.creditRating    - Counterparty S&P-style rating, e.g. 'BBB+'
 * @param {string}  params.settlementMethod- 'SWIFT' | 'SEPA' | 'CRYPTO' | 'LOCAL' | 'RTGS'
 * @param {number}  params.daysToValueDate - Calendar days until settlement
 *
 * @returns {{ score: number, level: string, breakdown: object }}
 */
function calculateRiskScore({
  amount,
  exposureLimit,
  currencyPair,
  creditRating     = 'UNRATED',
  settlementMethod = 'SWIFT',
  daysToValueDate  = 2,
}) {
  // ── 1. Amount vs. exposure limit (0–30) ─────────────────────────────
  let amountScore = 0;
  if (exposureLimit > 0) {
    const utilisation = amount / exposureLimit;
    amountScore = Math.min(utilisation, 1) * 30;
    if (utilisation > 1) amountScore = 30; // over limit → max
  }

  // ── 2. Currency volatility (0–20) ───────────────────────────────────
  const volKey   = Object.keys(CURRENCY_VOLATILITY).find(k => k === currencyPair) || 'DEFAULT';
  const vol      = CURRENCY_VOLATILITY[volKey];
  const volScore = Math.min(vol / 1.0, 1) * 20;   // normalise against theoretical max vol of 1.0

  // ── 3. Counterparty credit rating (0–25) ────────────────────────────
  const ratingKey   = (creditRating || 'UNRATED').toUpperCase();
  const creditScore = CREDIT_RATING_SCORE[ratingKey] ?? CREDIT_RATING_SCORE['UNRATED'];

  // ── 4. Settlement method (0–10) ─────────────────────────────────────
  const methodKey      = (settlementMethod || 'SWIFT').toUpperCase();
  const settlementScore = SETTLEMENT_SCORE[methodKey] ?? 5;

  // ── 5. Tenor / days to value date (0–15) ────────────────────────────
  // 0 days → 0 pts | 30+ days → 15 pts (linear, capped)
  const tenorScore = Math.min(daysToValueDate / 30, 1) * 15;

  // ── Aggregate ───────────────────────────────────────────────────────
  const rawScore = amountScore + volScore + creditScore + settlementScore + tenorScore;
  const score    = Math.round(Math.min(rawScore, 100));

  let level;
  if (score >= 75)      level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 25) level = 'MEDIUM';
  else                  level = 'LOW';

  return {
    score,
    level,
    breakdown: {
      amountVsLimit:    Math.round(amountScore * 10) / 10,
      currencyVolatility: Math.round(volScore * 10) / 10,
      counterpartyCredit: creditScore,
      settlementMethod:   settlementScore,
      tenor:              Math.round(tenorScore * 10) / 10,
    },
  };
}

module.exports = { calculateRiskScore };
