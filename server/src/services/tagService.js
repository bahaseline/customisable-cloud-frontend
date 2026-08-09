const { queryOne, queryRows, execute } = require('../db');

async function createTag(ownerId, name, color) {
  return queryOne(
    `INSERT INTO tags (owner_id, name, color)
     VALUES ($1, $2, COALESCE($3, '#1a73e8'))
     ON CONFLICT (owner_id, name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, owner_id, name, color, created_at`,
    [ownerId, name, color]
  );
}

async function getTagsForUser(ownerId) {
  return queryRows(
    'SELECT id, owner_id, name, color, created_at FROM tags WHERE owner_id = $1 ORDER BY name',
    [ownerId]
  );
}

async function updateTagColor(tagId, ownerId, color) {
  return queryOne(
    `UPDATE tags SET color = $3 WHERE id = $1 AND owner_id = $2
     RETURNING id, owner_id, name, color, created_at`,
    [tagId, ownerId, color]
  );
}

async function deleteTag(tagId, ownerId) {
  return queryOne('DELETE FROM tags WHERE id = $1 AND owner_id = $2 RETURNING id', [tagId, ownerId]);
}

async function getTagOwnedBy(tagId, ownerId) {
  return queryOne('SELECT id, owner_id, name, color FROM tags WHERE id = $1 AND owner_id = $2', [
    tagId,
    ownerId,
  ]);
}

async function attachTag(listItemId, tagId) {
  await execute(
    `INSERT INTO list_item_tags (list_item_id, tag_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [listItemId, tagId]
  );
}

async function detachTag(listItemId, tagId) {
  return queryOne(
    'DELETE FROM list_item_tags WHERE list_item_id = $1 AND tag_id = $2 RETURNING tag_id',
    [listItemId, tagId]
  );
}

async function getItemsByTag(ownerId, tagId) {
  return queryRows(
    `SELECT li.id, li.list_id, li.drive_file_id, li.file_name, li.added_by, li.added_at
     FROM list_items li
     JOIN list_item_tags lit ON lit.list_item_id = li.id
     JOIN custom_lists cl ON cl.id = li.list_id
     LEFT JOIN list_members m ON m.list_id = cl.id AND m.user_id = $2
     WHERE lit.tag_id = $1 AND (cl.owner_id = $2 OR m.user_id = $2)
     ORDER BY li.added_at DESC`,
    [tagId, ownerId]
  );
}

module.exports = {
  createTag,
  getTagsForUser,
  updateTagColor,
  deleteTag,
  getTagOwnedBy,
  attachTag,
  detachTag,
  getItemsByTag,
};
