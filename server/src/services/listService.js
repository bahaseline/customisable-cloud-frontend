const { queryOne, queryRows } = require('../db');

async function createList(ownerId, name) {
  return queryOne(
    `INSERT INTO custom_lists (owner_id, name)
     VALUES ($1, $2)
     RETURNING id, owner_id, name, is_shared, created_at`,
    [ownerId, name]
  );
}

async function getListsForUser(userId) {
  return queryRows(
    `SELECT DISTINCT l.id, l.owner_id, l.name, l.is_shared, l.created_at
     FROM custom_lists l
     LEFT JOIN list_members m ON m.list_id = l.id
     WHERE l.owner_id = $1 OR m.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );
}

async function getListOwnedBy(listId, ownerId) {
  return queryOne(
    'SELECT id, owner_id, name, is_shared, created_at FROM custom_lists WHERE id = $1 AND owner_id = $2',
    [listId, ownerId]
  );
}

async function deleteList(listId, ownerId) {
  return queryOne('DELETE FROM custom_lists WHERE id = $1 AND owner_id = $2 RETURNING id', [
    listId,
    ownerId,
  ]);
}

async function addItem(listId, { driveFileId, fileName, addedBy }) {
  return queryOne(
    `INSERT INTO list_items (list_id, drive_file_id, file_name, added_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, list_id, drive_file_id, file_name, added_by, added_at`,
    [listId, driveFileId, fileName, addedBy]
  );
}

async function removeItem(listId, itemId) {
  return queryOne('DELETE FROM list_items WHERE id = $1 AND list_id = $2 RETURNING id', [
    itemId,
    listId,
  ]);
}

async function getItemInList(listId, itemId) {
  return queryOne(
    'SELECT id, list_id, drive_file_id, file_name FROM list_items WHERE id = $1 AND list_id = $2',
    [itemId, listId]
  );
}

async function getItemsForList(listId) {
  return queryRows(
    `SELECT li.id, li.list_id, li.drive_file_id, li.file_name, li.added_by, li.added_at,
            COALESCE(
              json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
                FILTER (WHERE t.id IS NOT NULL),
              '[]'
            ) AS tags
     FROM list_items li
     LEFT JOIN list_item_tags lit ON lit.list_item_id = li.id
     LEFT JOIN tags t ON t.id = lit.tag_id
     WHERE li.list_id = $1
     GROUP BY li.id
     ORDER BY li.added_at DESC`,
    [listId]
  );
}

module.exports = {
  createList,
  getListsForUser,
  getListOwnedBy,
  deleteList,
  addItem,
  removeItem,
  getItemInList,
  getItemsForList,
};
