const axios = require('axios');

const BASE_URL   = process.env.OPEN_EXCHANGE_RATES_BASE_URL || 'https://openexchangerates.org/api';
const APP_ID     = process.env.OPEN_EXCHANGE_RATES_APP_ID   || '';

/** Simple in-memory cache to avoid hammering the free-tier API limit */
const cache = {
  rates:     null,
  fetchedAt: null,
  TTL_MS:    10 * 60 * 1000,   // 10 minutes
};

/**
 * Fetch latest FX rates (USD base) from OpenExchangeRates.
 * Returns cached data if still fresh.
 *
 * @returns {Promise<{ base: string, rates: Record<string, number>, timestamp: number }>}
 */
async function getLatestRates() {
  const now = Date.now();

  if (cache.rates && cache.fetchedAt && now - cache.fetchedAt < cache.TTL_MS) {
    return cache.rates;
  }

  if (!APP_ID) {
    throw new Error('OPEN_EXCHANGE_RATES_APP_ID is not configured.');
  }

  const { data } = await axios.get(`${BASE_URL}/latest.json`, {
    params: { app_id: APP_ID },
    timeout: 8000,
  });

  cache.rates     = data;
  cache.fetchedAt = now;

  return data;
}

/**
 * Convert an amount from one currency to another.
 *
 * @param {number}  amount
 * @param {string}  from   - e.g. 'USD'
 * @param {string}  to     - e.g. 'IDR'
 * @returns {Promise<{ amount: number, rate: number }>}
 */
async function convert(amount, from, to) {
  const { rates } = await getLatestRates();

  if (!rates[from]) throw new Error(`Unknown currency: ${from}`);
  if (!rates[to])   throw new Error(`Unknown currency: ${to}`);

  // OER base is always USD; convert via USD as pivot
  const inUSD = amount / rates[from];
  const result = inUSD * rates[to];
  const rate   = rates[to] / rates[from];

  return { amount: result, rate };
}

/**
 * Return the direct exchange rate from → to.
 *
 * @param {string} from
 * @param {string} to
 * @returns {Promise<number>}
 */
async function getRate(from, to) {
  const { rate } = await convert(1, from, to);
  return rate;
}

/**
 * Return rates for a specific list of currency codes.
 *
 * @param {string[]} currencies
 * @returns {Promise<Record<string, number>>}
 */
async function getRatesForCurrencies(currencies) {
  const { rates } = await getLatestRates();
  return Object.fromEntries(
    currencies.filter(c => rates[c]).map(c => [c, rates[c]])
  );
}

/** Force-invalidate the in-memory cache. */
function invalidateCache() {
  cache.rates     = null;
  cache.fetchedAt = null;
}

module.exports = { getLatestRates, convert, getRate, getRatesForCurrencies, invalidateCache };
