const router           = require('express').Router();
const ctrl             = require('../controllers/riskController');
const authenticate     = require('../middleware/auth');
const { requireRole }  = require('../middleware/roleCheck');

router.use(authenticate);

router.post('/calculate',
  requireRole('risk_analyst', 'finance_manager', 'admin'),
  ctrl.calculate
);

module.exports = router;
