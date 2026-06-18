const { pool }   = require('../config/database');
const fxService  = require('../services/fxRateService');

/** GET /api/currency-basket */
async function list(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM currency_baskets ORDER BY created_at DESC');
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

/** GET /api/currency-basket/:id */
async function getOne(req, res, next) {
  try {
    const [[basket]] = await pool.query('SELECT * FROM currency_baskets WHERE id = ?', [req.params.id]);
    if (!basket) return res.status(404).json({ success: false, message: 'Currency basket not found.' });

    const [components] = await pool.query(
      'SELECT * FROM basket_components WHERE basket_id = ?',
      [req.params.id]
    );

    return res.json({ success: true, data: { ...basket, components } });
  } catch (err) { next(err); }
}

/** POST /api/currency-basket */
async function create(req, res, next) {
  try {
    const { name, description, components } = req.body;

    if (!name || !Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ success: false, message: 'name and at least one component are required.' });
    }

    const totalWeight = components.reduce((s, c) => s + (parseFloat(c.weight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return res.status(400).json({ success: false, message: 'Component weights must sum to 100.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        'INSERT INTO currency_baskets (name, description, created_by) VALUES (?, ?, ?)',
        [name, description || null, req.user.id]
      );
      const basketId = result.insertId;

      for (const c of components) {
        await conn.query(
          'INSERT INTO basket_components (basket_id, currency, weight) VALUES (?, ?, ?)',
          [basketId, c.currency.toUpperCase(), c.weight]
        );
      }

      await conn.commit();

      const [[created]] = await conn.query('SELECT * FROM currency_baskets WHERE id = ?', [basketId]);
      const [comps]     = await conn.query('SELECT * FROM basket_components WHERE basket_id = ?', [basketId]);

      return res.status(201).json({ success: true, data: { ...created, components: comps } });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) { next(err); }
}

/** GET /api/currency-basket/:id/performance */
async function performance(req, res, next) {
  try {
    const [components] = await pool.query(
      'SELECT * FROM basket_components WHERE basket_id = ?',
      [req.params.id]
    );

    if (!components.length) {
      return res.status(404).json({ success: false, message: 'Basket not found.' });
    }

    const codes = components.map(c => c.currency);
    const rates = await fxService.getRatesForCurrencies(codes);

    const enriched = components.map(c => ({
      ...c,
      current_rate: rates[c.currency] ?? null,
    }));

    return res.json({ success: true, data: enriched });
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, performance };
