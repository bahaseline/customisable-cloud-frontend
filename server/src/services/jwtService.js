const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Short-lived, self-contained: a JWT with the user's ID and Google ID, signed with the server's secret. This is what the client uses to authenticate API requests.
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_BYTES = 32;
const REFRESH_TOKEN_TTL_DAYS = 30;

function signUserToken(user) {
  return jwt.sign(
    { id: user.id, googleId: user.google_id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function verifyUserToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function generateRefreshToken() {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

// Hashes a refresh token for storage in the database. The raw token is never stored, only its hash, so that if the database is compromised, the attacker cannot use the stolen hashes to mint new access tokens.
function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  signUserToken,
  verifyUserToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_DAYS,
};
