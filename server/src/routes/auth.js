const express = require('express');
const passport = require('passport');
const { signUserToken } = require('../services/jwtService');
const {
  issueRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} = require('../services/refreshTokenService');
const { revokeGoogleAccess } = require('../services/driveService');
const { getUserById } = require('../services/userService');
const { requireAuth } = require('../middleware/auth');

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
  async (req, res, next) => {
    try {
      const accessToken = signUserToken(req.user);
      const refreshToken = await issueRefreshToken(req.user.id);
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(
        `${clientUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (err) {
      next(err);
    }
  }
);

router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'Google authentication failed' });
});

// Logs the user out by revoking their refresh token and Google access, if provided.
router.post('/logout', requireAuth, async (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  await revokeGoogleAccess(req.user.id);
  res.status(204).end();
});

// Refreshes the user's access token using a valid refresh token. The old refresh token is revoked and a new one is issued.
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  const userId = await verifyRefreshToken(refreshToken);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const user = await getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  await revokeRefreshToken(refreshToken);
  const newRefreshToken = await issueRefreshToken(userId);
  const accessToken = signUserToken(user);

  res.json({ accessToken, refreshToken: newRefreshToken });
});

module.exports = router;
