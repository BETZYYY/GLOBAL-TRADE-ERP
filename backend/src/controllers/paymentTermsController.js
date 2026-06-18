const { pool } = require('../config/database');

/** GET /api/payment-terms */
async function list(req, res, next) {
  try {
    const { counterparty_id, page = 1, limit = 20 } = req.query;
    let sql = 'SELECT * FROM payment_terms WHERE 1=1';
    const args = [];

    if (counterparty_id) { sql += ' AND counterparty_id = ?'; args.push(counterparty_id); }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    args.push(parseInt(limit, 10), offset);

    const [rows] = await pool.query(sql, args);
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

/** GET /api/payment-terms/:id */
async function getOne(req, res, next) {
  try {
    const [[row]] = await pool.query('SELECT * FROM payment_terms WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Payment term not found.' });
    return res.json({ success: true, data: row });
  } catch (err) { next(err); }
}

/** POST /api/payment-terms */
async function create(req, res, next) {
  try {
    const { counterparty_id, term_type, days_net, discount_pct, penalty_pct, currency } = req.body;

    if (!counterparty_id || !term_type || days_net == null) {
      return res.status(400).json({ success: false, message: 'counterparty_id, term_type, days_net are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO payment_terms (counterparty_id, term_type, days_net, discount_pct, penalty_pct, currency, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [counterparty_id, term_type, days_net, discount_pct || 0, penalty_pct || 0, currency || 'USD', req.user.id]
    );

    const [[created]] = await pool.query('SELECT * FROM payment_terms WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
}

/** PATCH /api/payment-terms/:id */
async function update(req, res, next) {
  try {
    const allowed = ['term_type', 'days_net', 'discount_pct', 'penalty_pct', 'currency'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: 'No updatable fields provided.' });
    }

    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE payment_terms SET ${setClause} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    const [[row]] = await pool.query('SELECT * FROM payment_terms WHERE id = ?', [req.params.id]);
    return res.json({ success: true, data: row });
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update };
