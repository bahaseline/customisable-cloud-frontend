const express = require('express');
const passport = require('passport');
const { requireAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Browsers send cookies automatically, so /refresh needs CSRF protection. A
// custom header can't be added cross-origin without a CORS preflight, which
// only the client's own origin passes.
function requireXhrHeader(req, res, next) {
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Missing X-Requested-With header' });
  }
  next();
}

router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.readonly'],
    accessType: 'offline',
    prompt: 'consent',
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }),
  authController.googleCallback
);

router.get('/failure', authController.authFailure);
router.post('/logout', requireAuth, authController.logout);
router.post('/refresh', requireXhrHeader, authController.refresh);

module.exports = router;
