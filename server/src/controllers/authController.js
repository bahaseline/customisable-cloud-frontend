const { signUserToken, REFRESH_TOKEN_TTL_DAYS } = require('../services/jwtService');
const {
  issueRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} = require('../services/refreshTokenService');
const { revokeGoogleAccess } = require('../services/driveService');
const { getUserById } = require('../services/userService');

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

// No tokens in the redirect URL: the client exchanges this cookie for an
// access token via /auth/refresh once it lands.
async function googleCallback(req, res) {
  setRefreshCookie(res, await issueRefreshToken(req.user.id));
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  res.redirect(`${clientUrl}/auth/callback`);
}

function authFailure(req, res) {
  res.status(401).json({ error: 'Google authentication failed' });
}

async function logout(req, res) {
  const refreshToken = req.cookies[REFRESH_COOKIE];
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  clearRefreshCookie(res);
  await revokeGoogleAccess(req.user.id);
  res.status(204).end();
}

// The old refresh token is revoked and a new one replaces it in the cookie.
async function refresh(req, res) {
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
}

module.exports = { googleCallback, authFailure, logout, refresh };
