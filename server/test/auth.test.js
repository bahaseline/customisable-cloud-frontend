const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('./setup');
const request = require('supertest');

let app, pool;

test.before(async () => {
  await resetDb();
  app = require('../src/app');
  ({ pool } = require('../src/db'));
});

test.after(async () => {
  await pool.end();
});

test('GET /health does not require auth', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('GET /api/me without a token returns 401', async () => {
  const res = await request(app).get('/api/me');
  assert.equal(res.status, 401);
});

test('GET /api/lists with a malformed token returns 401', async () => {
  const res = await request(app).get('/api/lists').set('Authorization', 'Bearer not-a-real-token');
  assert.equal(res.status, 401);
});

test('GET /api/files/:fileId without a token returns 401', async () => {
  const res = await request(app).get('/api/files/some-file-id');
  assert.equal(res.status, 401);
});

async function createUser(suffix) {
  const { rows } = await pool.query(
    'INSERT INTO users (google_id, email) VALUES ($1, $2) RETURNING id',
    [`google-${suffix}`, `${suffix}@example.com`]
  );
  const { signUserToken } = require('../src/services/jwtService');
  return { id: rows[0].id, token: signUserToken({ id: rows[0].id, email: `${suffix}@example.com` }) };
}

test('POST /auth/logout without a token returns 401', async () => {
  const res = await request(app).post('/auth/logout');
  assert.equal(res.status, 401);
});

test('POST /auth/logout succeeds for a user with no stored Google tokens', async () => {
  const user = await createUser('logout-no-tokens');
  const res = await request(app)
    .post('/auth/logout')
    .set('Authorization', `Bearer ${user.token}`);
  assert.equal(res.status, 204);
});

function refresh(refreshToken) {
  const req = request(app).post('/auth/refresh').set('X-Requested-With', 'XMLHttpRequest');
  return refreshToken ? req.set('Cookie', `refreshToken=${refreshToken}`) : req;
}

function refreshCookieFrom(res) {
  return (res.headers['set-cookie'] || []).find((c) => c.startsWith('refreshToken='));
}

test('POST /auth/refresh without the X-Requested-With header is rejected as a possible CSRF', async () => {
  const res = await request(app).post('/auth/refresh').set('Cookie', 'refreshToken=anything');
  assert.equal(res.status, 403);
});

test('POST /auth/refresh without a refresh cookie returns 401', async () => {
  const res = await refresh();
  assert.equal(res.status, 401);
});

test('POST /auth/refresh with an unknown token returns 401 and clears the cookie', async () => {
  const res = await refresh('not-a-real-token');
  assert.equal(res.status, 401);
  assert.match(refreshCookieFrom(res), /^refreshToken=;/);
});

test('a valid refresh cookie exchanges for a new access token and a rotated, httpOnly cookie', async () => {
  const user = await createUser('refresh-flow');
  const refreshTokenService = require('../src/services/refreshTokenService');
  const { verifyUserToken } = require('../src/services/jwtService');
  const originalRefreshToken = await refreshTokenService.issueRefreshToken(user.id);

  const res = await refresh(originalRefreshToken);
  assert.equal(res.status, 200);
  assert.ok(res.body.accessToken);
  assert.equal(res.body.refreshToken, undefined, 'the refresh token must never appear in a response body');

  const cookie = refreshCookieFrom(res);
  assert.ok(cookie, 'a new refresh cookie should be set');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Path=\/auth/);
  assert.match(cookie, /SameSite=Lax/);
  assert.ok(!cookie.startsWith(`refreshToken=${originalRefreshToken};`), 'the cookie should hold a rotated token');

  // The new access token authenticates, and carries the real user, not a
  // bare id with email/name silently dropped.
  const decoded = verifyUserToken(res.body.accessToken);
  assert.equal(decoded.id, user.id);
  assert.equal(decoded.email, 'refresh-flow@example.com');

  const whoAmI = await request(app).get('/api/me').set('Authorization', `Bearer ${res.body.accessToken}`);
  assert.equal(whoAmI.status, 200);
  assert.equal(whoAmI.body.user.id, user.id);

  // Rotation: the token just used cannot be used a second time.
  const reuse = await refresh(originalRefreshToken);
  assert.equal(reuse.status, 401);
});

test('POST /auth/logout revokes the refresh cookie and clears it', async () => {
  const user = await createUser('logout-revokes-refresh');
  const refreshTokenService = require('../src/services/refreshTokenService');
  const refreshToken = await refreshTokenService.issueRefreshToken(user.id);

  const logoutRes = await request(app)
    .post('/auth/logout')
    .set('Authorization', `Bearer ${user.token}`)
    .set('Cookie', `refreshToken=${refreshToken}`);
  assert.equal(logoutRes.status, 204);
  assert.match(refreshCookieFrom(logoutRes), /^refreshToken=;/);

  const refreshAfterLogout = await refresh(refreshToken);
  assert.equal(refreshAfterLogout.status, 401);
});

test('a user with no stored Google tokens is told access is disconnected, not given a generic error', async () => {
  const user = await createUser('never-connected');
  const res = await request(app)
    .get('/api/files')
    .set('Authorization', `Bearer ${user.token}`);
  assert.equal(res.status, 401);
  assert.match(res.body.error, /disconnected/i);
});
