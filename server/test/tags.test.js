const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('./setup');
const request = require('supertest');

let app, pool, token;

test.before(async () => {
  await resetDb();
  app = require('../src/app');
  ({ pool } = require('../src/db'));
  const { signUserToken } = require('../src/services/jwtService');

  const result = await pool.query(
    'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id',
    ['test-google-id', 'test@example.com', 'Test User']
  );
  token = signUserToken({
    id: result.rows[0].id,
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

test('tag a list item and search for it by tag, then untag', async () => {
  const tagRes = await authed(request(app).post('/api/tags')).send({ name: 'Big Project' });
  assert.equal(tagRes.status, 201);
  const tagId = tagRes.body.tag.id;

  const listRes = await authed(request(app).post('/api/lists')).send({ name: 'Project Files' });
  const listId = listRes.body.list.id;

  const itemRes = await authed(request(app).post(`/api/lists/${listId}/items`)).send({
    driveFileId: 'drive-file-1',
    fileName: 'Report Draft',
  });
  const itemId = itemRes.body.item.id;

  const attach = await authed(
    request(app).post(`/api/lists/${listId}/items/${itemId}/tags`)
  ).send({ tagId });
  assert.equal(attach.status, 204);

  const listDetail = await authed(request(app).get(`/api/lists/${listId}`));
  assert.equal(listDetail.body.items[0].tags.length, 1);
  assert.equal(listDetail.body.items[0].tags[0].name, 'Big Project');

  const search = await authed(request(app).get(`/api/items?tag=${tagId}`));
  assert.equal(search.status, 200);
  assert.equal(search.body.items.length, 1);
  assert.equal(search.body.items[0].id, itemId);

  const detach = await authed(
    request(app).delete(`/api/lists/${listId}/items/${itemId}/tags/${tagId}`)
  );
  assert.equal(detach.status, 204);

  const searchAfter = await authed(request(app).get(`/api/items?tag=${tagId}`));
  assert.equal(searchAfter.body.items.length, 0);
});

test('duplicate tag names for the same user are rejected via upsert, not duplicated', async () => {
  const first = await authed(request(app).post('/api/tags')).send({ name: 'Duplicate' });
  const second = await authed(request(app).post('/api/tags')).send({ name: 'Duplicate' });
  assert.equal(first.body.tag.id, second.body.tag.id);

  const all = await authed(request(app).get('/api/tags'));
  const matching = all.body.tags.filter((t) => t.name === 'Duplicate');
  assert.equal(matching.length, 1);
});
