const router      = require('express').Router();
const ctrl        = require('../controllers/paymentTermsController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/',      ctrl.list);
router.get('/:id',   ctrl.getOne);
router.post('/',     ctrl.create);
router.patch('/:id', ctrl.update);

module.exports = router;
