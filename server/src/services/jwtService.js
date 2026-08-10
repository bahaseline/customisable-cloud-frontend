const jwt = require('jsonwebtoken');

const JWT_EXPIRY = '7d';

// TODO: Improve token revocation and logout security.
// Currently, signed tokens remain valid for 7 days and cannot be revoked.
// Logout only removes the token client-side, meaning a compromised token
// remains usable until expiry.
// Consider using short-lived access tokens with refresh tokens, or maintain
// a server-side deny-list for revoked token IDs.

function signUserToken(user) {
  return jwt.sign(
    { id: user.id, googleId: user.google_id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function verifyUserToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signUserToken, verifyUserToken };
