const { queryOne, queryRows, execute } = require('../db');

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
    `SELECT l.id, l.owner_id, l.name, l.is_shared, l.created_at,
            CASE WHEN l.owner_id = $1 THEN 'owner' ELSE m.role END AS role
     FROM custom_lists l
     LEFT JOIN list_members m ON m.list_id = l.id AND m.user_id = $1
     WHERE l.owner_id = $1 OR m.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );
}

// Resolves a user's effective role on a list: 'owner' from custom_lists.owner_id,
// otherwise the role recorded in list_members. Undefined when they have no access.
async function getListAccess(listId, userId) {
  return queryOne(
    `SELECT l.id, l.owner_id, l.name, l.is_shared, l.created_at,
            CASE WHEN l.owner_id = $2 THEN 'owner' ELSE m.role END AS role
     FROM custom_lists l
     LEFT JOIN list_members m ON m.list_id = l.id AND m.user_id = $2
     WHERE l.id = $1 AND (l.owner_id = $2 OR m.user_id = $2)`,
    [listId, userId]
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

// TODO: this returns every tag on an item regardless of who created it, so a
// member's private labels are visible to everyone on a shared list. Decide
// whether tags are personal (filter by owner_id) or shared (leave as is) —
// Seo et al. (2026) note that visibility can feel like surveillance.
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

async function getMembersForList(listId) {
  return queryRows(
    `SELECT u.id AS user_id, u.email, u.name, 'owner' AS role, l.created_at AS added_at
     FROM custom_lists l
     JOIN users u ON u.id = l.owner_id
     WHERE l.id = $1
     UNION ALL
     SELECT u.id AS user_id, u.email, u.name, m.role, m.added_at
     FROM list_members m
     JOIN users u ON u.id = m.user_id
     WHERE m.list_id = $1
     ORDER BY added_at`,
    [listId]
  );
}

async function addMember(listId, userId, role) {
  const member = await queryOne(
    `INSERT INTO list_members (list_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (list_id, user_id) DO UPDATE SET role = EXCLUDED.role
     RETURNING id, list_id, user_id, role, added_at`,
    [listId, userId, role]
  );
  await execute('UPDATE custom_lists SET is_shared = TRUE WHERE id = $1', [listId]);
  return member;
}

async function removeMember(listId, userId) {
  const removed = await queryOne(
    'DELETE FROM list_members WHERE list_id = $1 AND user_id = $2 RETURNING user_id',
    [listId, userId]
  );
  await execute(
    `UPDATE custom_lists SET is_shared = EXISTS (SELECT 1 FROM list_members WHERE list_id = $1)
     WHERE id = $1`,
    [listId]
  );
  return removed;
}

module.exports = {
  createList,
  getListsForUser,
  getListAccess,
  deleteList,
  addItem,
  removeItem,
  getItemInList,
  getItemsForList,
  getMembersForList,
  addMember,
  removeMember,
};
