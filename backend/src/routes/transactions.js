const router           = require('express').Router();
const ctrl             = require('../controllers/transactionsController');
const authenticate     = require('../middleware/auth');
const { requireRole }  = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/',                    ctrl.list);
router.get('/:id',                 ctrl.getOne);
router.post('/',                   ctrl.create);
router.patch('/:id/approve',       requireRole('finance_manager', 'admin'), ctrl.approve);
router.patch('/:id/reject',        requireRole('finance_manager', 'admin'), ctrl.reject);

module.exports = router;
