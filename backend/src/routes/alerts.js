const router      = require('express').Router();
const ctrl        = require('../controllers/alertsController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/',           ctrl.list);
router.patch('/:id/read', ctrl.markRead);

module.exports = router;
