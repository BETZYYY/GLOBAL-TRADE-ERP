const router           = require('express').Router();
const ctrl             = require('../controllers/ratesController');
const authenticate     = require('../middleware/auth');
const { requireRole }  = require('../middleware/roleCheck');

router.use(authenticate);

// IMPORTANT: /latest must be registered BEFORE / to avoid being shadowed
router.get('/latest',   ctrl.latestForPair);        // GET /api/rates/latest?from=USD&to=IDR
router.get('/',          ctrl.latest);               // GET /api/rates  (all pairs)
router.get('/history',   ctrl.history);
router.post('/fetch',    requireRole('admin', 'treasury_officer'), ctrl.fetchFromAPI);

module.exports = router;
