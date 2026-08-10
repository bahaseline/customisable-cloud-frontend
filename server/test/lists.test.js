const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('./setup');
const request = require('supertest');

let app, pool, token, userId;

test.before(async () => {
  await resetDb();
  app = require('../src/app');
  ({ pool } = require('../src/db'));
  const { signUserToken } = require('../src/services/jwtService');

  const result = await pool.query(
    'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id',
    ['test-google-id', 'test@example.com', 'Test User']
  );
  userId = result.rows[0].id;
  token = signUserToken({
    id: userId,
    google_id: 'test-google-id',
    email: 'test@example.com',
    name: 'Test User',
  });
});

test.after(async () => {
  await pool.end();
});

function authed(req) {
  return req.set('Authorization', `Bearer ${token}`);
}

test('full custom list CRUD lifecycle', async () => {
  const create = await authed(request(app).post('/api/lists')).send({ name: 'Test List' });
  assert.equal(create.status, 201);
  assert.equal(create.body.list.name, 'Test List');
  assert.equal(create.body.list.ownerId, userId);
  const listId = create.body.list.id;

  const list = await authed(request(app).get('/api/lists'));
  assert.equal(list.status, 200);
  assert.equal(list.body.lists.length, 1);
  assert.equal(list.body.lists[0].id, listId);

  const addItem = await authed(request(app).post(`/api/lists/${listId}/items`)).send({
    driveFileId: 'drive-file-1',
    fileName: 'Report.docx',
  });
  assert.equal(addItem.status, 201);
  assert.equal(addItem.body.item.driveFileId, 'drive-file-1');
  const itemId = addItem.body.item.id;

  const detail = await authed(request(app).get(`/api/lists/${listId}`));
  assert.equal(detail.status, 200);
  assert.equal(detail.body.list.id, listId);
  assert.equal(detail.body.items.length, 1);
  assert.equal(detail.body.items[0].id, itemId);
  assert.deepEqual(detail.body.items[0].tags, []);

  const removeItem = await authed(
    request(app).delete(`/api/lists/${listId}/items/${itemId}`)
  );
  assert.equal(removeItem.status, 204);

  const rename = await authed(request(app).put(`/api/lists/${listId}`)).send({ name: 'Renamed List' });
  assert.equal(rename.status, 200);
  assert.equal(rename.body.list.name, 'Renamed List');

  const emptyRename = await authed(request(app).put(`/api/lists/${listId}`)).send({ name: '  ' });
  assert.equal(emptyRename.status, 400);

  const deleteList = await authed(request(app).delete(`/api/lists/${listId}`));
  assert.equal(deleteList.status, 204);

  const listAfter = await authed(request(app).get('/api/lists'));
  assert.equal(listAfter.body.lists.length, 0);
});

test('POST /api/lists without a name returns 400', async () => {
  const res = await authed(request(app).post('/api/lists')).send({});
  assert.equal(res.status, 400);
});

test('DELETE /api/lists/:listId with a malformed id returns 400, not 500', async () => {
  const res = await authed(request(app).delete('/api/lists/not-a-uuid'));
  assert.equal(res.status, 400);
});

test('a user cannot delete another user\'s list', async () => {
  const otherUser = await pool.query(
    'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id',
    ['other-google-id', 'other@example.com', 'Other User']
  );
  const otherList = await pool.query(
    'INSERT INTO custom_lists (owner_id, name) VALUES ($1, $2) RETURNING id',
    [otherUser.rows[0].id, 'Not Yours']
  );

  const res = await authed(request(app).delete(`/api/lists/${otherList.rows[0].id}`));
  assert.equal(res.status, 404);
});
