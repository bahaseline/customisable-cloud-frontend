const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('./setup');
const request = require('supertest');

let app, pool, fileOpenService, alice, bob;

async function createUser(suffix) {
  const { rows } = await pool.query(
    'INSERT INTO users (google_id, email) VALUES ($1, $2) RETURNING id',
    [`google-${suffix}`, `${suffix}@example.com`]
  );
  const { signUserToken } = require('../src/services/jwtService');
  return { id: rows[0].id, token: signUserToken({ id: rows[0].id, email: `${suffix}@example.com` }) };
}

test.before(async () => {
  await resetDb();
  app = require('../src/app');
  ({ pool } = require('../src/db'));
  fileOpenService = require('../src/services/fileOpenService');

  alice = await createUser('alice');
  bob = await createUser('bob');
});

test.after(async () => {
  await pool.end();
});

function as(user, req) {
  return req.set('Authorization', `Bearer ${user.token}`);
}

test('opening the same file repeatedly increments one row rather than adding rows', async () => {
  await fileOpenService.recordOpen(alice.id, 'file-a', 'Report.docx');
  await fileOpenService.recordOpen(alice.id, 'file-a', 'Report.docx');
  await fileOpenService.recordOpen(alice.id, 'file-a', 'Report.docx');

  const { rows } = await pool.query(
    'SELECT open_count FROM file_opens WHERE user_id = $1 AND drive_file_id = $2',
    [alice.id, 'file-a']
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].open_count, 3);
});

test('frequently used files come back most-opened first', async () => {
  await fileOpenService.recordOpen(alice.id, 'file-b', 'Notes.txt');
  await fileOpenService.recordOpen(alice.id, 'file-b', 'Notes.txt');
  await fileOpenService.recordOpen(alice.id, 'file-c', 'Once.pdf');

  const res = await as(alice, request(app).get('/api/files/frequent'));
  assert.equal(res.status, 200);

  const order = res.body.files.map((f) => f.driveFileId);
  assert.deepEqual(order, ['file-a', 'file-b', 'file-c']);
  assert.equal(res.body.files[0].openCount, 3);
  assert.equal(res.body.files[0].fileName, 'Report.docx');
});

test('counts are per user: one person\'s opens never appear for another', async () => {
  await fileOpenService.recordOpen(bob.id, 'file-z', 'Bob Only.docx');

  const forBob = await as(bob, request(app).get('/api/files/frequent'));
  assert.deepEqual(forBob.body.files.map((f) => f.driveFileId), ['file-z']);

  const forAlice = await as(alice, request(app).get('/api/files/frequent'));
  assert.ok(!forAlice.body.files.some((f) => f.driveFileId === 'file-z'));
});

test('a new user has no frequently used files, and the route needs a token', async () => {
  const fresh = await createUser('fresh');
  const res = await as(fresh, request(app).get('/api/files/frequent'));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.files, []);

  assert.equal((await request(app).get('/api/files/frequent')).status, 401);
});
