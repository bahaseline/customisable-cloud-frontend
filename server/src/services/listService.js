const { pool } = require('../db');

async function createList(ownerId, name) {
  const result = await pool.query(
    `INSERT INTO custom_lists (owner_id, name)
     VALUES ($1, $2)
     RETURNING id, owner_id, name, is_shared, created_at`,
    [ownerId, name]
  );
  return result.rows[0];
}

async function getListsForUser(userId) {
  const result = await pool.query(
    `SELECT DISTINCT l.id, l.owner_id, l.name, l.is_shared, l.created_at
     FROM custom_lists l
     LEFT JOIN list_members m ON m.list_id = l.id
     WHERE l.owner_id = $1 OR m.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getListOwnedBy(listId, ownerId) {
  const result = await pool.query(
    'SELECT id, owner_id, name, is_shared, created_at FROM custom_lists WHERE id = $1 AND owner_id = $2',
    [listId, ownerId]
  );
  return result.rows[0];
}

async function deleteList(listId, ownerId) {
  const result = await pool.query(
    'DELETE FROM custom_lists WHERE id = $1 AND owner_id = $2 RETURNING id',
    [listId, ownerId]
  );
  return result.rows[0];
}

async function addItem(listId, { driveFileId, fileName, addedBy }) {
  const result = await pool.query(
    `INSERT INTO list_items (list_id, drive_file_id, file_name, added_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, list_id, drive_file_id, file_name, added_by, added_at`,
    [listId, driveFileId, fileName, addedBy]
  );
  return result.rows[0];
}

async function removeItem(listId, itemId) {
  const result = await pool.query(
    'DELETE FROM list_items WHERE id = $1 AND list_id = $2 RETURNING id',
    [itemId, listId]
  );
  return result.rows[0];
}

async function getItemInList(listId, itemId) {
  const result = await pool.query(
    'SELECT id, list_id, drive_file_id, file_name FROM list_items WHERE id = $1 AND list_id = $2',
    [itemId, listId]
  );
  return result.rows[0];
}

async function getItemsForList(listId) {
  const result = await pool.query(
    `SELECT li.id, li.list_id, li.drive_file_id, li.file_name, li.added_by, li.added_at,
            COALESCE(
              json_agg(json_build_object('id', t.id, 'name', t.name))
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
  return result.rows;
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
