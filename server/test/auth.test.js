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
