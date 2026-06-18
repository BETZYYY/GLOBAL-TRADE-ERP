const router      = require('express').Router();
const ctrl        = require('../controllers/currencyBasketController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/',                ctrl.list);
router.get('/:id',             ctrl.getOne);
router.post('/',               ctrl.create);
router.get('/:id/performance', ctrl.performance);

module.exports = router;
