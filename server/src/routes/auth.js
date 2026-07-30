const express = require('express');
const passport = require('passport');
const { signUserToken } = require('../services/jwtService');

const router = express.Router();

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
  (req, res) => {
    const token = signUserToken(req.user);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  }
);

router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'Google authentication failed' });
});

router.post('/logout', (req, res) => {
  // JWT is stateless — client just discards the token.
  res.status(204).end();
});

module.exports = router;
