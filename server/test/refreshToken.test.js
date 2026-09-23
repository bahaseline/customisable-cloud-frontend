const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('./setup');

let pool, refreshTokenService, userId;

test.before(async () => {
  await resetDb();
  ({ pool } = require('../src/db'));
  refreshTokenService = require('../src/services/refreshTokenService');

  const { rows } = await pool.query(
    'INSERT INTO users (google_id, email) VALUES ($1, $2) RETURNING id',
    ['google-refresh-test', 'refresh-test@example.com']
  );
  userId = rows[0].id;
});

test.after(async () => {
  await pool.end();
});

test('an issued refresh token verifies to the user it was issued for', async () => {
  const token = await refreshTokenService.issueRefreshToken(userId);
  assert.equal(typeof token, 'string');
  assert.ok(token.length >= 32, 'token should be high-entropy, not a short id');

  const verifiedUserId = await refreshTokenService.verifyRefreshToken(token);
  assert.equal(verifiedUserId, userId);
});

test('an unknown token does not verify', async () => {
  const verifiedUserId = await refreshTokenService.verifyRefreshToken('not-a-real-token');
  assert.equal(verifiedUserId, undefined);
});

test('a revoked token no longer verifies', async () => {
  const token = await refreshTokenService.issueRefreshToken(userId);
  await refreshTokenService.revokeRefreshToken(token);

  const verifiedUserId = await refreshTokenService.verifyRefreshToken(token);
  assert.equal(verifiedUserId, undefined);
});

test('the raw token is never stored — only its hash is in the database', async () => {
  const token = await refreshTokenService.issueRefreshToken(userId);
  const { rows } = await pool.query('SELECT token_hash FROM refresh_tokens WHERE user_id = $1', [userId]);
  assert.ok(rows.every((r) => r.token_hash !== token), 'raw token found stored in plaintext');
});

test('two tokens for the same user (two devices) are revoked independently', async () => {
  const tokenA = await refreshTokenService.issueRefreshToken(userId);
  const tokenB = await refreshTokenService.issueRefreshToken(userId);

  await refreshTokenService.revokeRefreshToken(tokenA);

  assert.equal(await refreshTokenService.verifyRefreshToken(tokenA), undefined);
  assert.equal(await refreshTokenService.verifyRefreshToken(tokenB), userId);
});

test('revoking an already-revoked token does not error, and does not affect other tokens', async () => {
  const token = await refreshTokenService.issueRefreshToken(userId);
  await refreshTokenService.revokeRefreshToken(token);
  await refreshTokenService.revokeRefreshToken(token); // should not throw
  assert.equal(await refreshTokenService.verifyRefreshToken(token), undefined);
});
