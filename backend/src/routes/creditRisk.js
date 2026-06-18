const router      = require('express').Router();
const ctrl        = require('../controllers/creditRiskController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(authenticate);

router.post('/score', requireRole('risk_analyst', 'finance_manager', 'admin'), ctrl.score);

module.exports = router;
