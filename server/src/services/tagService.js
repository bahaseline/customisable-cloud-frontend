const { pool } = require('../db');

async function createTag(ownerId, name, color) {
  const result = await pool.query(
    `INSERT INTO tags (owner_id, name, color)
     VALUES ($1, $2, COALESCE($3, '#1a73e8'))
     ON CONFLICT (owner_id, name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, owner_id, name, color, created_at`,
    [ownerId, name, color]
  );
  return result.rows[0];
}

async function getTagsForUser(ownerId) {
  const result = await pool.query(
    'SELECT id, owner_id, name, color, created_at FROM tags WHERE owner_id = $1 ORDER BY name',
    [ownerId]
  );
  return result.rows;
}

async function updateTagColor(tagId, ownerId, color) {
  const result = await pool.query(
    `UPDATE tags SET color = $3 WHERE id = $1 AND owner_id = $2
     RETURNING id, owner_id, name, color, created_at`,
    [tagId, ownerId, color]
  );
  return result.rows[0];
}

async function deleteTag(tagId, ownerId) {
  const result = await pool.query(
    'DELETE FROM tags WHERE id = $1 AND owner_id = $2 RETURNING id',
    [tagId, ownerId]
  );
  return result.rows[0];
}

async function getTagOwnedBy(tagId, ownerId) {
  const result = await pool.query(
    'SELECT id, owner_id, name, color FROM tags WHERE id = $1 AND owner_id = $2',
    [tagId, ownerId]
  );
  return result.rows[0];
}

async function attachTag(listItemId, tagId) {
  await pool.query(
    `INSERT INTO list_item_tags (list_item_id, tag_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [listItemId, tagId]
  );
}

async function detachTag(listItemId, tagId) {
  const result = await pool.query(
    'DELETE FROM list_item_tags WHERE list_item_id = $1 AND tag_id = $2 RETURNING tag_id',
    [listItemId, tagId]
  );
  return result.rows[0];
}

async function getItemsByTag(ownerId, tagId) {
  const result = await pool.query(
    `SELECT li.id, li.list_id, li.drive_file_id, li.file_name, li.added_by, li.added_at
     FROM list_items li
     JOIN list_item_tags lit ON lit.list_item_id = li.id
     JOIN custom_lists cl ON cl.id = li.list_id
     WHERE lit.tag_id = $1 AND cl.owner_id = $2
     ORDER BY li.added_at DESC`,
    [tagId, ownerId]
  );
  return result.rows;
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
