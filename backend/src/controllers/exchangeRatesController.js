const fxService = require('../services/fxRateService');

/** GET /api/exchange-rates/latest */
async function latest(req, res, next) {
  try {
    const data = await fxService.getLatestRates();
    return res.json({ success: true, data });
  } catch (err) { next(err); }
}

/** GET /api/exchange-rates/convert?from=USD&to=IDR&amount=1000 */
async function convertRate(req, res, next) {
  try {
    const { from, to, amount = 1 } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, message: '"from" and "to" query params are required.' });
    }

    const result = await fxService.convert(parseFloat(amount), from.toUpperCase(), to.toUpperCase());
    return res.json({ success: true, data: { from, to, amount: parseFloat(amount), ...result } });
  } catch (err) { next(err); }
}

/** GET /api/exchange-rates/currencies?codes=USD,IDR,EUR */
async function getCurrencies(req, res, next) {
  try {
    const codes = req.query.codes
      ? req.query.codes.split(',').map(c => c.trim().toUpperCase())
      : ['USD', 'EUR', 'GBP', 'JPY', 'SGD', 'AUD', 'CNY', 'IDR'];

    const rates = await fxService.getRatesForCurrencies(codes);
    return res.json({ success: true, data: rates });
  } catch (err) { next(err); }
}

/** POST /api/exchange-rates/cache/invalidate  (admin only) */
async function invalidateCache(req, res) {
  fxService.invalidateCache();
  return res.json({ success: true, message: 'FX rate cache invalidated.' });
}

module.exports = { latest, convertRate, getCurrencies, invalidateCache };
