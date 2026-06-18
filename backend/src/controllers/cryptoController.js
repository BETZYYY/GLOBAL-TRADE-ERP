const { pool } = require('../config/database');

/** GET /api/crypto */
async function list(req, res, next) {
  try {
    const { status, network, page = 1, limit = 20 } = req.query;
    let sql = 'SELECT * FROM crypto_settlements WHERE 1=1';
    const args = [];

    if (status)  { sql += ' AND status = ?';  args.push(status); }
    if (network) { sql += ' AND network = ?'; args.push(network); }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    args.push(parseInt(limit, 10), offset);

    const [rows] = await pool.query(sql, args);
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

/** GET /api/crypto/:id */
async function getOne(req, res, next) {
  try {
    const [[row]] = await pool.query('SELECT * FROM crypto_settlements WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Crypto settlement not found.' });
    return res.json({ success: true, data: row });
  } catch (err) { next(err); }
}

/** POST /api/crypto */
async function create(req, res, next) {
  try {
    const { transaction_id, network, token, amount_token, wallet_address, tx_hash } = req.body;

    if (!network || !token || !amount_token || !wallet_address) {
      return res.status(400).json({
        success: false,
        message: 'network, token, amount_token, wallet_address are required.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO crypto_settlements
         (transaction_id, network, token, amount_token, wallet_address, tx_hash, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [transaction_id || null, network, token, amount_token, wallet_address, tx_hash || null, req.user.id]
    );

    const [[created]] = await pool.query('SELECT * FROM crypto_settlements WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
}

/** PATCH /api/crypto/:id/status */
async function updateStatus(req, res, next) {
  try {
    const { status, tx_hash, confirmed_at } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required.' });
    }

    const allowed = ['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
    }

    await pool.query(
      'UPDATE crypto_settlements SET status = ?, tx_hash = COALESCE(?, tx_hash), confirmed_at = ? WHERE id = ?',
      [status, tx_hash || null, confirmed_at || null, req.params.id]
    );

    const [[row]] = await pool.query('SELECT * FROM crypto_settlements WHERE id = ?', [req.params.id]);
    return res.json({ success: true, data: row });
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, updateStatus };
