const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('./setup');
const request = require('supertest');

let app, pool, signUserToken;
let owner, editor, viewer, outsider;

async function createUser(suffix) {
  const result = await pool.query(
    'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id, email',
    [`google-${suffix}`, `${suffix}@example.com`, `${suffix} User`]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    token: signUserToken({ id: row.id, google_id: `google-${suffix}`, email: row.email }),
  };
}

test.before(async () => {
  await resetDb();
  app = require('../src/app');
  ({ pool } = require('../src/db'));
  ({ signUserToken } = require('../src/services/jwtService'));

  owner = await createUser('owner');
  editor = await createUser('editor');
  viewer = await createUser('viewer');
  outsider = await createUser('outsider');
});

test.after(async () => {
  await pool.end();
});

function as(user, req) {
  return req.set('Authorization', `Bearer ${user.token}`);
}

async function createList(name) {
  const res = await as(owner, request(app).post('/api/lists')).send({ name });
  return res.body.list.id;
}

test('owner can share a list, and members then see it in their own list index', async () => {
  const listId = await createList('Shared List');

  // Before sharing, the list is invisible to everyone else.
  const before = await as(viewer, request(app).get('/api/lists'));
  assert.equal(before.body.lists.length, 0);

  const invite = await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({
    email: viewer.email,
    role: 'viewer',
  });
  assert.equal(invite.status, 201);
  assert.equal(invite.body.member.role, 'viewer');

  const after = await as(viewer, request(app).get('/api/lists'));
  assert.equal(after.body.lists.length, 1);
  assert.equal(after.body.lists[0].id, listId);
  assert.equal(after.body.lists[0].role, 'viewer');

  // The owner's own index reports 'owner' for the same list.
  const ownerIndex = await as(owner, request(app).get('/api/lists'));
  assert.equal(ownerIndex.body.lists.find((l) => l.id === listId).role, 'owner');
});

test('a viewer can read a shared list but cannot modify its contents', async () => {
  const listId = await createList('Read Only');
  await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({
    email: viewer.email,
    role: 'viewer',
  });

  const read = await as(viewer, request(app).get(`/api/lists/${listId}`));
  assert.equal(read.status, 200);
  assert.equal(read.body.list.role, 'viewer');

  const write = await as(viewer, request(app).post(`/api/lists/${listId}/items`)).send({
    driveFileId: 'drive-1',
    fileName: 'Nope.docx',
  });
  assert.equal(write.status, 403);

  const del = await as(viewer, request(app).delete(`/api/lists/${listId}`));
  assert.equal(del.status, 403);
});

test('an editor can add and remove items on a shared list', async () => {
  const listId = await createList('Editable');
  await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({
    email: editor.email,
    role: 'editor',
  });

  const add = await as(editor, request(app).post(`/api/lists/${listId}/items`)).send({
    driveFileId: 'drive-2',
    fileName: 'Draft.docx',
  });
  assert.equal(add.status, 201);
  // The item records who actually added it, not the list owner.
  assert.equal(add.body.item.addedBy, editor.id);

  const remove = await as(
    editor,
    request(app).delete(`/api/lists/${listId}/items/${add.body.item.id}`)
  );
  assert.equal(remove.status, 204);

  // An editor still cannot delete the list itself or manage membership.
  assert.equal((await as(editor, request(app).delete(`/api/lists/${listId}`))).status, 403);
  const invite = await as(editor, request(app).post(`/api/lists/${listId}/members`)).send({
    email: outsider.email,
  });
  assert.equal(invite.status, 403);
});

test('a non-member gets 404 (not 403) so unshared lists stay invisible', async () => {
  const listId = await createList('Private');

  assert.equal((await as(outsider, request(app).get(`/api/lists/${listId}`))).status, 404);
  assert.equal((await as(outsider, request(app).delete(`/api/lists/${listId}`))).status, 404);
  const write = await as(outsider, request(app).post(`/api/lists/${listId}/items`)).send({
    driveFileId: 'x',
  });
  assert.equal(write.status, 404);
});

test('members can be listed, re-roled, and removed', async () => {
  const listId = await createList('Membership');

  await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({
    email: viewer.email,
    role: 'viewer',
  });

  const members = await as(owner, request(app).get(`/api/lists/${listId}/members`));
  assert.equal(members.status, 200);
  assert.equal(members.body.members.length, 2); // owner + viewer
  assert.equal(members.body.members[0].role, 'owner');

  // Re-inviting the same person updates their role instead of duplicating them.
  const promote = await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({
    email: viewer.email,
    role: 'editor',
  });
  assert.equal(promote.status, 201);
  const afterPromote = await as(owner, request(app).get(`/api/lists/${listId}/members`));
  assert.equal(afterPromote.body.members.length, 2);
  assert.equal(afterPromote.body.members.find((m) => m.email === viewer.email).role, 'editor');

  const remove = await as(
    owner,
    request(app).delete(`/api/lists/${listId}/members/${viewer.id}`)
  );
  assert.equal(remove.status, 204);

  // Access is revoked immediately.
  assert.equal((await as(viewer, request(app).get(`/api/lists/${listId}`))).status, 404);
});

test('inviting rejects unknown emails, bad roles, and the owner themselves', async () => {
  const listId = await createList('Validation');

  const unknown = await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({
    email: 'nobody@example.com',
  });
  assert.equal(unknown.status, 404);

  const badRole = await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({
    email: viewer.email,
    role: 'superuser',
  });
  assert.equal(badRole.status, 400);

  const selfInvite = await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({
    email: owner.email,
  });
  assert.equal(selfInvite.status, 400);

  const noEmail = await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({});
  assert.equal(noEmail.status, 400);
});

test('a member can find their own tagged items inside a list they do not own', async () => {
  const listId = await createList('Tagged Shared');
  await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({
    email: editor.email,
    role: 'editor',
  });

  const item = await as(owner, request(app).post(`/api/lists/${listId}/items`)).send({
    driveFileId: 'drive-shared-1',
    fileName: 'Spec.docx',
  });

  // The editor creates their own tag and applies it to an item in someone else's list.
  const tag = await as(editor, request(app).post('/api/tags')).send({ name: 'MyReview' });
  const attach = await as(
    editor,
    request(app).post(`/api/lists/${listId}/items/${item.body.item.id}/tags`)
  ).send({ tagId: tag.body.tag.id });
  assert.equal(attach.status, 204);

  const found = await as(editor, request(app).get(`/api/items?tag=${tag.body.tag.id}`));
  assert.equal(found.status, 200);
  assert.equal(found.body.items.length, 1);
  assert.equal(found.body.items[0].driveFileId, 'drive-shared-1');
});

test('tags are personal: members only see their own labels on a shared list', async () => {
  const listId = await createList('Private Labels');
  await as(owner, request(app).post(`/api/lists/${listId}/members`)).send({
    email: viewer.email,
    role: 'viewer',
  });

  const item = await as(owner, request(app).post(`/api/lists/${listId}/items`)).send({
    driveFileId: 'drive-labels-1',
    fileName: 'Notes.docx',
  });
  const itemId = item.body.item.id;

  const ownerTag = await as(owner, request(app).post('/api/tags')).send({ name: 'OwnerOnly' });
  const viewerTag = await as(viewer, request(app).post('/api/tags')).send({ name: 'ViewerOnly' });

  assert.equal(
    (
      await as(owner, request(app).post(`/api/lists/${listId}/items/${itemId}/tags`)).send({
        tagId: ownerTag.body.tag.id,
      })
    ).status,
    204
  );
  // Viewers may label for themselves, they cannot change list membership or items.
  assert.equal(
    (
      await as(viewer, request(app).post(`/api/lists/${listId}/items/${itemId}/tags`)).send({
        tagId: viewerTag.body.tag.id,
      })
    ).status,
    204
  );

  const asOwner = await as(owner, request(app).get(`/api/lists/${listId}`));
  assert.deepEqual(
    asOwner.body.items[0].tags.map((t) => t.name).sort(),
    ['OwnerOnly']
  );

  const asViewer = await as(viewer, request(app).get(`/api/lists/${listId}`));
  assert.deepEqual(
    asViewer.body.items[0].tags.map((t) => t.name).sort(),
    ['ViewerOnly']
  );

  // A viewer cannot strip someone else's personal label.
  const steal = await as(
    viewer,
    request(app).delete(`/api/lists/${listId}/items/${itemId}/tags/${ownerTag.body.tag.id}`)
  );
  assert.equal(steal.status, 404);
});
