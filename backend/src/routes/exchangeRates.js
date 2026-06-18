const router           = require('express').Router();
const ctrl             = require('../controllers/ratesController');
const authenticate     = require('../middleware/auth');
const { requireRole }  = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/',          ctrl.latest);
router.get('/history',   ctrl.history);
router.post('/fetch',    requireRole('admin', 'treasury_officer'), ctrl.fetchFromAPI);

module.exports = router;
