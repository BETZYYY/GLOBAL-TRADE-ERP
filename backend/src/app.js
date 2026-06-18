require('dotenv').config();

const http = require('http');
const express = require('express');
const cors    = require('cors');

const { connectDB, pool } = require('./config/database');
const { initSocket, getIo } = require('./lib/socket');

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const transactionsRoutes = require('./routes/transactions');
const exchangeRatesRoutes= require('./routes/exchangeRates');
const riskRoutes         = require('./routes/riskAssessment');
const hedgingRoutes      = require('./routes/hedging');
const creditRiskRoutes   = require('./routes/creditRisk');
const alertsRoutes       = require('./routes/alerts');
const dashboardRoutes    = require('./routes/dashboard');

// Legacy routes kept for compatibility
const currencyBasketRoutes = require('./routes/currencyBasket');
const paymentTermsRoutes   = require('./routes/paymentTerms');
const cryptoRoutes         = require('./routes/crypto');

const app  = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Init Socket.io
initSocket(server);

// ── Core Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin:         process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials:    true,
  methods:        ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger (dev only) ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    const ts = new Date().toTimeString().slice(0, 8);
    console.log(`[${ts}] ${req.method.padEnd(6)} ${req.originalUrl}`);
    next();
  });
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success:   true,
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime:    Math.round(process.uptime()),
    env:       process.env.NODE_ENV || 'development',
    version:   '2.0.0',
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/transactions',   transactionsRoutes);
app.use('/api/rates',          exchangeRatesRoutes);     // NEW: /api/rates
app.use('/api/risk',           riskRoutes);              // NEW: /api/risk
app.use('/api/hedging',        hedgingRoutes);
app.use('/api/credit-risk',    creditRiskRoutes);
app.use('/api/alerts',         alertsRoutes);            // NEW: /api/alerts
app.use('/api/dashboard',      dashboardRoutes);         // NEW: /api/dashboard
// Legacy / additional
app.use('/api/currency-basket', currencyBasketRoutes);
app.use('/api/payment-terms',   paymentTermsRoutes);
app.use('/api/crypto',          cryptoRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Data duplikat terdeteksi.' });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Referensi data tidak valid (foreign key).' });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah kadaluarsa.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message    = process.env.NODE_ENV === 'production'
    ? 'Terjadi kesalahan internal server.'
    : (err.message || 'Terjadi kesalahan.');

  return res.status(statusCode).json({ success: false, message });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
(async () => {
  try {
    await connectDB();
    
    // Start Rate Updater Interval
    setInterval(async () => {
      try {
        const [rates] = await pool.execute(
          `SELECT kode_mata_uang_dari, kode_mata_uang_ke, nilai_kurs, timestamp_fetch 
           FROM tb_nilai_tukar 
           WHERE is_realtime = TRUE`
        );
        getIo().emit('rate_updated', rates);
      } catch (err) {
        console.error('Failed to emit rate_updated:', err.message);
      }
    }, 60000); // 60 seconds

    server.listen(PORT, () => {
      console.log(`\n🚀  GlobalTrade ERP API    →  http://localhost:${PORT}`);
      console.log(`🏥  Health check           →  http://localhost:${PORT}/api/health`);
      console.log(`\n📋  Routes:`);
      console.log(`    POST /api/auth/login`);
      console.log(`    GET  /api/transactions`);
      console.log(`    GET  /api/rates`);
      console.log(`    POST /api/risk/calculate`);
      console.log(`    GET  /api/hedging`);
      console.log(`    POST /api/credit-risk/score`);
      console.log(`    GET  /api/alerts`);
      console.log(`    GET  /api/dashboard/summary\n`);
    });
  } catch (err) {
    console.error('Server gagal start:', err.message);
    process.exit(1);
  }
})();

module.exports = app;
