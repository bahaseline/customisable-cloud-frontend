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

async function createUser(suffix) {
  const { signUserToken } = require('../src/services/jwtService');
  const email = `${suffix}@example.com`;
  const { rows } = await pool.query(
    'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id',
    [`google-${suffix}`, email, suffix]
  );
  return {
    id: rows[0].id,
    email,
    token: signUserToken({ id: rows[0].id, google_id: `google-${suffix}`, email, name: suffix }),
  };
}

function authed(req, token) {
  return req.set('Authorization', `Bearer ${token}`);
}

async function addMember(listId, ownerToken, email, role) {
  await authed(request(app).post(`/api/lists/${listId}/members`), ownerToken).send({ email, role });
}

test('a shared tag with no attachments yet is invisible to everyone but its owner', async () => {
  const owner = await createUser('owner1');
  const viewer = await createUser('viewer1');

  const list = await authed(request(app).post('/api/lists'), owner.token).send({ name: 'Unattached Share' });
  const listId = list.body.list.id;
  await addMember(listId, owner.token, viewer.email, 'viewer');

  const tag = await authed(request(app).post('/api/tags'), owner.token).send({
    name: 'Not yet used',
    visibility: 'shared',
  });
  assert.equal(tag.status, 201);
  assert.equal(tag.body.tag.visibility, 'shared');

  const viewerTags = await authed(request(app).get(`/api/tags?listId=${listId}`), viewer.token);
  assert.ok(!viewerTags.body.tags.some((t) => t.name === 'Not yet used'));

  const ownerTags = await authed(request(app).get(`/api/tags?listId=${listId}`), owner.token);
  assert.ok(ownerTags.body.tags.some((t) => t.name === 'Not yet used'));
});

test('once the owner attaches a shared tag to an item, every member of that list can see it', async () => {
  const owner = await createUser('owner2');
  const viewer = await createUser('viewer2');

  const list = await authed(request(app).post('/api/lists'), owner.token).send({ name: 'Reaches Members' });
  const listId = list.body.list.id;
  await addMember(listId, owner.token, viewer.email, 'viewer');

  const tag = await authed(request(app).post('/api/tags'), owner.token).send({
    name: 'Now visible',
    visibility: 'shared',
  });
  const item = await authed(request(app).post(`/api/lists/${listId}/items`), owner.token).send({
    driveFileId: 'drive-file-1',
    fileName: 'Doc',
  });
  const attach = await authed(request(app).post(`/api/lists/${listId}/items/${item.body.item.id}/tags`), owner.token)
    .send({ tagId: tag.body.tag.id });
  assert.equal(attach.status, 204);

  const viewerTags = await authed(request(app).get(`/api/tags?listId=${listId}`), viewer.token);
  assert.ok(viewerTags.body.tags.some((t) => t.name === 'Now visible'));
});

test('attaching or detaching a shared tag requires editor access, even for a tag that has already reached the list', async () => {
  const owner = await createUser('owner2b');
  const editor = await createUser('editor2b');
  const viewer = await createUser('viewer2b');

  const list = await authed(request(app).post('/api/lists'), owner.token).send({ name: 'Shared Tag Permissions' });
  const listId = list.body.list.id;
  await addMember(listId, owner.token, editor.email, 'editor');
  await addMember(listId, owner.token, viewer.email, 'viewer');

  const tag = await authed(request(app).post('/api/tags'), owner.token).send({
    name: 'Editor gated',
    visibility: 'shared',
  });
  const item = await authed(request(app).post(`/api/lists/${listId}/items`), owner.token).send({
    driveFileId: 'drive-file-gated-1',
    fileName: 'Doc',
  });
  await authed(request(app).post(`/api/lists/${listId}/items/${item.body.item.id}/tags`), owner.token).send({
    tagId: tag.body.tag.id,
  });

  const secondItem = await authed(request(app).post(`/api/lists/${listId}/items`), owner.token).send({
    driveFileId: 'drive-file-gated-2',
    fileName: 'Doc 2',
  });

  // A viewer can see the shared tag by now, but attaching it is a change
  // everyone else sees too — that requires editor access, same bar as
  // adding or removing a file.
  const viewerAttach = await authed(
    request(app).post(`/api/lists/${listId}/items/${secondItem.body.item.id}/tags`),
    viewer.token
  ).send({ tagId: tag.body.tag.id });
  assert.equal(viewerAttach.status, 403);

  const editorAttach = await authed(
    request(app).post(`/api/lists/${listId}/items/${secondItem.body.item.id}/tags`),
    editor.token
  ).send({ tagId: tag.body.tag.id });
  assert.equal(editorAttach.status, 204);

  const viewerDetach = await authed(
    request(app).delete(`/api/lists/${listId}/items/${secondItem.body.item.id}/tags/${tag.body.tag.id}`),
    viewer.token
  );
  assert.equal(viewerDetach.status, 403);

  const editorDetach = await authed(
    request(app).delete(`/api/lists/${listId}/items/${secondItem.body.item.id}/tags/${tag.body.tag.id}`),
    editor.token
  );
  assert.equal(editorDetach.status, 204);
});

test('a shared tag attached on one list stays invisible on a different list until it reaches that one too', async () => {
  const owner = await createUser('owner3');
  const member = await createUser('member3');

  const listA = await authed(request(app).post('/api/lists'), owner.token).send({ name: 'List A' });
  const listB = await authed(request(app).post('/api/lists'), owner.token).send({ name: 'List B' });
  await addMember(listA.body.list.id, owner.token, member.email, 'editor');
  await addMember(listB.body.list.id, owner.token, member.email, 'editor');

  const tag = await authed(request(app).post('/api/tags'), owner.token).send({
    name: 'Scoped by use',
    visibility: 'shared',
  });
  const itemInA = await authed(request(app).post(`/api/lists/${listA.body.list.id}/items`), owner.token).send({
    driveFileId: 'drive-file-a',
    fileName: 'Doc A',
  });
  await authed(request(app).post(`/api/lists/${listA.body.list.id}/items/${itemInA.body.item.id}/tags`), owner.token)
    .send({ tagId: tag.body.tag.id });

  // member belongs to both lists, but the tag has only reached List A.
  const memberTagsOnB = await authed(request(app).get(`/api/tags?listId=${listB.body.list.id}`), member.token);
  assert.ok(!memberTagsOnB.body.tags.some((t) => t.name === 'Scoped by use'));

  const itemInB = await authed(request(app).post(`/api/lists/${listB.body.list.id}/items`), member.token).send({
    driveFileId: 'drive-file-b',
    fileName: 'Doc B',
  });
  const crossListAttach = await authed(
    request(app).post(`/api/lists/${listB.body.list.id}/items/${itemInB.body.item.id}/tags`),
    member.token
  ).send({ tagId: tag.body.tag.id });
  assert.equal(crossListAttach.status, 404);

  // The owner, however, can freely bring it into List B too — it's their tag.
  const ownerAttachB = await authed(
    request(app).post(`/api/lists/${listB.body.list.id}/items/${itemInB.body.item.id}/tags`),
    owner.token
  ).send({ tagId: tag.body.tag.id });
  assert.equal(ownerAttachB.status, 204);

  const memberTagsOnBAfter = await authed(request(app).get(`/api/tags?listId=${listB.body.list.id}`), member.token);
  assert.ok(memberTagsOnBAfter.body.tags.some((t) => t.name === 'Scoped by use'));
});

test('creating or re-visibilitying a tag as shared carries no list/role permission check', async () => {
  const owner = await createUser('owner4');
  const viewer = await createUser('viewer4');

  const list = await authed(request(app).post('/api/lists'), owner.token).send({ name: 'Any List' });
  await addMember(list.body.list.id, owner.token, viewer.email, 'viewer');

  // viewer has only viewer access to this list, yet can freely create and
  // hold a shared tag of their own — sharing is a property of the tag, not
  // a privileged action gated by list role.
  const tag = await authed(request(app).post('/api/tags'), viewer.token).send({
    name: 'No gate needed',
    visibility: 'shared',
  });
  assert.equal(tag.status, 201);
  assert.equal(tag.body.tag.visibility, 'shared');
});

test('private tags never become visible to anyone else, even once attached to a shared item', async () => {
  const owner = await createUser('owner5');
  const viewer = await createUser('viewer5');

  const list = await authed(request(app).post('/api/lists'), owner.token).send({ name: 'Private Stays Private' });
  const listId = list.body.list.id;
  await addMember(listId, owner.token, viewer.email, 'viewer');

  const privateTag = await authed(request(app).post('/api/tags'), owner.token).send({ name: 'Mine only' });
  const item = await authed(request(app).post(`/api/lists/${listId}/items`), owner.token).send({
    driveFileId: 'drive-file-private',
    fileName: 'Doc',
  });
  await authed(request(app).post(`/api/lists/${listId}/items/${item.body.item.id}/tags`), owner.token).send({
    tagId: privateTag.body.tag.id,
  });

  const viewerTags = await authed(request(app).get(`/api/tags?listId=${listId}`), viewer.token);
  assert.ok(!viewerTags.body.tags.some((t) => t.name === 'Mine only'));

  const viewerAttach = await authed(
    request(app).post(`/api/lists/${listId}/items/${item.body.item.id}/tags`),
    viewer.token
  ).send({ tagId: privateTag.body.tag.id });
  assert.equal(viewerAttach.status, 404);
});

test('only the tag creator can rename, re-visibility, or delete a tag, regardless of list ownership', async () => {
  const owner = await createUser('owner6');
  const editor = await createUser('editor6');

  const list = await authed(request(app).post('/api/lists'), owner.token).send({ name: 'Creator Only' });
  const listId = list.body.list.id;
  await addMember(listId, owner.token, editor.email, 'editor');

  const tag = await authed(request(app).post('/api/tags'), editor.token).send({
    name: "Editor's tag",
    visibility: 'shared',
  });

  const ownerTriesRecolor = await authed(request(app).put(`/api/tags/${tag.body.tag.id}`), owner.token).send({
    color: '#188038',
  });
  assert.equal(ownerTriesRecolor.status, 404);

  const ownerTriesVisibility = await authed(request(app).put(`/api/tags/${tag.body.tag.id}`), owner.token).send({
    visibility: 'private',
  });
  assert.equal(ownerTriesVisibility.status, 404);

  const ownerTriesDelete = await authed(request(app).delete(`/api/tags/${tag.body.tag.id}`), owner.token);
  assert.equal(ownerTriesDelete.status, 404);

  const creatorRecolors = await authed(request(app).put(`/api/tags/${tag.body.tag.id}`), editor.token).send({
    color: '#188038',
  });
  assert.equal(creatorRecolors.status, 200);
});

test('a tag name is unique per owner: re-creating it updates its colour and visibility', async () => {
  const owner = await createUser('owner7');

  const first = await authed(request(app).post('/api/tags'), owner.token).send({ name: 'Reused' });
  const second = await authed(request(app).post('/api/tags'), owner.token).send({
    name: 'Reused',
    color: '#d93025',
    visibility: 'shared',
  });
  // Same owner + same name is the same row (upsert by name). Creating it
  // again applies the new colour and visibility — the owner could already
  // change both with a PUT, so this grants nothing new.
  assert.equal(second.status, 201);
  assert.equal(second.body.tag.id, first.body.tag.id);
  assert.equal(second.body.tag.color, '#d93025');
  assert.equal(second.body.tag.visibility, 'shared');
});

test('switching a tag from shared back to private hides it again, even where it had already reached', async () => {
  const owner = await createUser('owner8');
  const viewer = await createUser('viewer8');

  const list = await authed(request(app).post('/api/lists'), owner.token).send({ name: 'Toggle Back' });
  const listId = list.body.list.id;
  await addMember(listId, owner.token, viewer.email, 'viewer');

  const tag = await authed(request(app).post('/api/tags'), owner.token).send({
    name: 'Toggled',
    visibility: 'shared',
  });
  const item = await authed(request(app).post(`/api/lists/${listId}/items`), owner.token).send({
    driveFileId: 'drive-file-toggle',
    fileName: 'Doc',
  });
  await authed(request(app).post(`/api/lists/${listId}/items/${item.body.item.id}/tags`), owner.token).send({
    tagId: tag.body.tag.id,
  });

  const visibleFirst = await authed(request(app).get(`/api/tags?listId=${listId}`), viewer.token);
  assert.ok(visibleFirst.body.tags.some((t) => t.name === 'Toggled'));

  const toPrivate = await authed(request(app).put(`/api/tags/${tag.body.tag.id}`), owner.token).send({
    visibility: 'private',
  });
  assert.equal(toPrivate.status, 200);
  assert.equal(toPrivate.body.tag.visibility, 'private');

  const hiddenAfter = await authed(request(app).get(`/api/tags?listId=${listId}`), viewer.token);
  assert.ok(!hiddenAfter.body.tags.some((t) => t.name === 'Toggled'));
});

test('a viewer can tag files with private tags only, and their shared tags never reach the list', async () => {
  const owner = await createUser('owner9');
  const viewer = await createUser('viewer9');

  const list = await authed(request(app).post('/api/lists'), owner.token).send({ name: 'Viewer Tags' });
  const listId = list.body.list.id;
  await addMember(listId, owner.token, viewer.email, 'viewer');
  const item = await authed(request(app).post(`/api/lists/${listId}/items`), owner.token).send({
    driveFileId: 'drive-file-viewer-tags',
    fileName: 'Doc',
  });
  const itemTagsUrl = `/api/lists/${listId}/items/${item.body.item.id}/tags`;

  const sharedTag = await authed(request(app).post('/api/tags'), viewer.token).send({
    name: 'Viewer shared',
    visibility: 'shared',
  });
  const sharedAttach = await authed(request(app).post(itemTagsUrl), viewer.token).send({
    tagId: sharedTag.body.tag.id,
  });
  assert.equal(sharedAttach.status, 403);

  const privateTag = await authed(request(app).post('/api/tags'), viewer.token).send({ name: 'Viewer private' });
  const privateAttach = await authed(request(app).post(itemTagsUrl), viewer.token).send({
    tagId: privateTag.body.tag.id,
  });
  assert.equal(privateAttach.status, 204);

  await authed(request(app).put(`/api/tags/${privateTag.body.tag.id}`), viewer.token).send({ visibility: 'shared' });
  const ownerView = await authed(request(app).get(`/api/lists/${listId}`), owner.token);
  assert.deepEqual(ownerView.body.items[0].tags, []);
  const viewerView = await authed(request(app).get(`/api/lists/${listId}`), viewer.token);
  assert.deepEqual(viewerView.body.items[0].tags.map((t) => t.name), ['Viewer private']);

  const detach = await authed(
    request(app).delete(`${itemTagsUrl}/${privateTag.body.tag.id}`),
    viewer.token
  );
  assert.equal(detach.status, 403);
});
