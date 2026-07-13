const jwt = require('jsonwebtoken');

const JWT_EXPIRY = '7d';

function signUserToken(user) {
  return jwt.sign(
    { googleId: user.googleId, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function verifyUserToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signUserToken, verifyUserToken };
