const { queryOne, queryRows, execute } = require('../db');

const TAG_FIELDS = 'id, owner_id, name, color, visibility, created_at';

// SQL condition: the owner of tag `t` can edit list `listExpr` (they own it
// or are an editor on it). A shared tag only reaches a list's other members
// through someone with edit rights there - a viewer's shared tag stays
// personal on a list they can only view, same as a private one.
function tagOwnerCanEdit(listExpr) {
  return `EXISTS (
    SELECT 1 FROM custom_lists ecl
    LEFT JOIN list_members elm ON elm.list_id = ecl.id AND elm.user_id = t.owner_id
    WHERE ecl.id = ${listExpr} AND (ecl.owner_id = t.owner_id OR elm.role = 'editor')
  )`;
}

async function createTag(ownerId, name, color, visibility = 'private') {
  return queryOne(
    `INSERT INTO tags (owner_id, name, color, visibility)
     VALUES ($1, $2, COALESCE($3, '#1a73e8'), $4)
     ON CONFLICT (owner_id, name)
       DO UPDATE SET color = EXCLUDED.color, visibility = EXCLUDED.visibility
     RETURNING ${TAG_FIELDS}`,
    [ownerId, name, color, visibility]
  );
}

// Every tag the user owns, private or shared, plus — when listId is given —
// any other member's shared tag that's already attached to at least one
// item on that list (only if the requester actually has access to it). A
// shared tag with no attachments yet on a list you're browsing simply
// hasn't reached anyone there, so it stays invisible until it does.
async function getTagsForUser(ownerId, listId) {
  return queryRows(
    `SELECT t.id, t.owner_id, t.name, t.color, t.visibility, t.created_at
     FROM tags t
     WHERE t.owner_id = $1
        OR (
          t.visibility = 'shared'
          AND EXISTS (
            SELECT 1 FROM list_item_tags lit
            JOIN list_items li ON li.id = lit.list_item_id
            WHERE lit.tag_id = t.id AND li.list_id = $2
          )
          AND ${tagOwnerCanEdit('$2')}
          AND EXISTS (
            SELECT 1 FROM custom_lists cl
            LEFT JOIN list_members lm ON lm.list_id = cl.id AND lm.user_id = $1
            WHERE cl.id = $2 AND (cl.owner_id = $1 OR lm.user_id = $1)
          )
        )
     ORDER BY name`,
    [ownerId, listId || null]
  );
}

async function updateTagColor(tagId, ownerId, color) {
  return queryOne(
    `UPDATE tags SET color = $3 WHERE id = $1 AND owner_id = $2
     RETURNING ${TAG_FIELDS}`,
    [tagId, ownerId, color]
  );
}

async function setTagVisibility(tagId, ownerId, visibility) {
  return queryOne(
    `UPDATE tags SET visibility = $3 WHERE id = $1 AND owner_id = $2
     RETURNING ${TAG_FIELDS}`,
    [tagId, ownerId, visibility]
  );
}

async function deleteTag(tagId, ownerId) {
  return queryOne('DELETE FROM tags WHERE id = $1 AND owner_id = $2 RETURNING id', [tagId, ownerId]);
}

// A tag a user may browse items by: one they own outright, or a shared tag
// already attached to at least one item on a list they belong to.
async function getTagUsableBy(tagId, userId) {
  return queryOne(
    `SELECT ${TAG_FIELDS} FROM tags t
     WHERE t.id = $1
       AND (
         t.owner_id = $2
         OR (
           t.visibility = 'shared' AND EXISTS (
             SELECT 1 FROM list_item_tags lit
             JOIN list_items li ON li.id = lit.list_item_id
             JOIN custom_lists cl ON cl.id = li.list_id
             LEFT JOIN list_members lm ON lm.list_id = cl.id AND lm.user_id = $2
             WHERE lit.tag_id = t.id AND (cl.owner_id = $2 OR lm.user_id = $2)
               AND ${tagOwnerCanEdit('cl.id')}
           )
         )
       )`,
    [tagId, userId]
  );
}

// A tag a user may attach/detach on an item inside one specific list: one
// they own outright, or a shared tag already attached to at least one item
// on that same list. List access itself is verified upstream by
// requireListAccess, so this only checks the tag's own reach — a shared tag
// that hasn't reached this list yet isn't usable here (only its owner can
// be the one to introduce it, since the owner_id branch has no such
// requirement).
async function getTagUsableInList(tagId, userId, listId) {
  return queryOne(
    `SELECT ${TAG_FIELDS} FROM tags t
     WHERE t.id = $1
       AND (
         t.owner_id = $2
         OR (
           t.visibility = 'shared' AND EXISTS (
             SELECT 1 FROM list_item_tags lit
             JOIN list_items li ON li.id = lit.list_item_id
             WHERE lit.tag_id = t.id AND li.list_id = $3
           )
           AND ${tagOwnerCanEdit('$3')}
         )
       )`,
    [tagId, userId, listId]
  );
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
     JOIN tags t ON t.id = lit.tag_id
     JOIN custom_lists cl ON cl.id = li.list_id
     LEFT JOIN list_members m ON m.list_id = cl.id AND m.user_id = $2
     WHERE lit.tag_id = $1 AND (cl.owner_id = $2 OR m.user_id = $2)
       AND (t.owner_id = $2 OR ${tagOwnerCanEdit('cl.id')})
     ORDER BY li.added_at DESC`,
    [tagId, ownerId]
  );
}

module.exports = {
  tagOwnerCanEdit,
  createTag,
  getTagsForUser,
  updateTagColor,
  setTagVisibility,
  deleteTag,
  getTagUsableBy,
  getTagUsableInList,
  attachTag,
  detachTag,
  getItemsByTag,
};
