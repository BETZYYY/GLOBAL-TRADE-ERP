const router           = require('express').Router();
const ctrl             = require('../controllers/hedgingController');
const authenticate     = require('../middleware/auth');
const { requireRole }  = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/',          ctrl.list);
router.post('/',         requireRole('treasury_officer', 'finance_manager', 'admin'), ctrl.create);
router.get('/recommend', ctrl.recommend);

module.exports = router;
