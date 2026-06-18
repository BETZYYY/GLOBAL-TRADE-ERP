const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306', 10),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'globaltrade_erp',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',         // store/retrieve in UTC
  decimalNumbers:     true,             // return DECIMAL as JS numbers
  supportBigNumbers:  true,
  bigNumberStrings:   false,
});

/**
 * Verify the pool can actually reach the database.
 * Called once at startup; throws on failure so the process exits early.
 */
async function connectDB() {
  let conn;
  try {
    conn = await pool.getConnection();
    const [[{ version }]] = await conn.query('SELECT VERSION() AS version');
    console.log(`✅  MySQL connected  (${version})`);
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { pool, connectDB };
