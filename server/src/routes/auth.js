const express = require('express');
const passport = require('passport');
const { signUserToken, REFRESH_TOKEN_TTL_DAYS } = require('../services/jwtService');
const {
  issueRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} = require('../services/refreshTokenService');
const { revokeGoogleAccess } = require('../services/driveService');
const { getUserById } = require('../services/userService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/auth',
};

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS);
}

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
  async (req, res, next) => {
    try {
      // No tokens in the redirect URL: the client exchanges this cookie for
      // an access token via /auth/refresh once it lands.
      const refreshToken = await issueRefreshToken(req.user.id);
      setRefreshCookie(res, refreshToken);
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${clientUrl}/auth/callback`);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'Google authentication failed' });
});

// Logs the user out by revoking their refresh token and Google access.
router.post('/logout', requireAuth, async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE];
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  clearRefreshCookie(res);
  await revokeGoogleAccess(req.user.id);
  res.status(204).end();
});

// Exchanges the refresh-token cookie for a new access token. The old refresh
// token is revoked and a new one replaces it in the cookie.
router.post('/refresh', requireXhrHeader, async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE];
  if (!refreshToken) {
    return res.status(401).json({ error: 'Not signed in' });
  }

  const userId = await verifyRefreshToken(refreshToken);
  const user = userId && (await getUserById(userId));
  if (!user) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  await revokeRefreshToken(refreshToken);
  setRefreshCookie(res, await issueRefreshToken(userId));

  res.json({ accessToken: signUserToken(user) });
});

module.exports = router;
