const router       = require('express').Router();
const ctrl         = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// ── Public ────────────────────────────────────────────────
router.post('/login',  ctrl.login);

// ── Protected ─────────────────────────────────────────────
router.post('/logout', authenticate, ctrl.logout);
router.get('/me',      authenticate, ctrl.getMe);

module.exports = router;
