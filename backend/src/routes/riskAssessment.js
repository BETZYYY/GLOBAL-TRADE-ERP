const router           = require('express').Router();
const ctrl             = require('../controllers/riskController');
const authenticate     = require('../middleware/auth');
const { requireRole }  = require('../middleware/roleCheck');

router.use(authenticate);

// GET  /api/risk/transaction/:id  — fetch latest risk analysis for a transaction
router.get('/transaction/:id', ctrl.getByTransaction);

// POST /api/risk/calculate        — run risk calculation
router.post('/calculate',
  requireRole('risk_analyst', 'finance_manager', 'admin'),
  ctrl.calculate
);

module.exports = router;
