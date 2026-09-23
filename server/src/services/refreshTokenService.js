const { queryOne, execute } = require('../db');
const { generateRefreshToken, hashRefreshToken, REFRESH_TOKEN_TTL_DAYS } = require('./jwtService');

// Issues a new refresh token for the given user ID, storing its hash in the database with an expiration date. Returns the raw token to be sent to the client.
async function issueRefreshToken(userId) {
  const token = generateRefreshToken();
  await queryOne(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + $3 * INTERVAL '1 day')
     RETURNING id`,
    [userId, hashRefreshToken(token), REFRESH_TOKEN_TTL_DAYS]
  );
  return token;
}

// Verifies a refresh token by looking up its hash in the database. Returns the associated user ID if valid, or null if invalid or expired.
async function verifyRefreshToken(token) {
  const row = await queryOne(
    `SELECT user_id FROM refresh_tokens
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
    [hashRefreshToken(token)]
  );
  return row?.user_id;
}

// Revokes a refresh token by marking it as revoked in the database. The raw token is never stored, only its hash.
async function revokeRefreshToken(token) {
  await execute(
    `UPDATE refresh_tokens SET revoked_at = NOW()
     WHERE token_hash = $1 AND revoked_at IS NULL`,
    [hashRefreshToken(token)]
  );
}

module.exports = { issueRefreshToken, verifyRefreshToken, revokeRefreshToken };
