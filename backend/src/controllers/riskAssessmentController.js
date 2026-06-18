const { calculateRiskScore } = require('../services/riskEngine');
const { convert }            = require('../services/fxRateService');
const { pool }               = require('../config/database');

/** POST /api/risk-assessment/calculate */
async function calculate(req, res, next) {
  try {
    const {
      amount, exposure_limit, currency_pair,
      credit_rating, settlement_method, value_date,
    } = req.body;

    if (!amount || !currency_pair) {
      return res.status(400).json({ success: false, message: 'amount and currency_pair are required.' });
    }

    const daysToValueDate = value_date
      ? Math.max(0, Math.round((new Date(value_date) - new Date()) / 86_400_000))
      : 2;

    const result = calculateRiskScore({
      amount: parseFloat(amount),
      exposureLimit: parseFloat(exposure_limit || 5_000_000),
      currencyPair: currency_pair,
      creditRating: credit_rating || 'UNRATED',
      settlementMethod: settlement_method || 'SWIFT',
      daysToValueDate,
    });

    return res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

/** GET /api/risk-assessment/summary */
async function summary(req, res, next) {
  try {
    const [[totals]] = await pool.query(`
      SELECT
        COUNT(*)                                             AS total,
        SUM(risk_level = 'HIGH' OR risk_level = 'CRITICAL') AS high_risk_count,
        SUM(risk_level = 'MEDIUM')                           AS medium_risk_count,
        SUM(risk_level = 'LOW')                              AS low_risk_count,
        AVG(risk_score)                                      AS avg_risk_score,
        SUM(idr_exposure)                                    AS total_idr_exposure
      FROM transactions
    `);

    return res.json({ success: true, data: totals });
  } catch (err) { next(err); }
}

/** GET /api/risk-assessment/high-risk */
async function highRisk(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM transactions
       WHERE risk_level IN ('HIGH','CRITICAL')
       ORDER BY risk_score DESC
       LIMIT 50`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

module.exports = { calculate, summary, highRisk };
