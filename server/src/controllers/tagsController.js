const tagService = require('../services/tagService');
const { keysToCamel } = require('../utils/camelCase');

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

async function createTag(req, res) {
  const { name, color, visibility = 'private' } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (color && !HEX_COLOR.test(color)) {
    return res.status(400).json({ error: 'color must be a hex value like #1a73e8' });
  }
  if (!['private', 'shared'].includes(visibility)) {
    return res.status(400).json({ error: "visibility must be 'private' or 'shared'" });
  }

  // Marking a tag 'shared' doesn't expose it to anyone by itself — that only
  // happens once it's attached to an item someone else can see, which is
  // already access-controlled by the list routes.
  const tag = await tagService.createTag(req.user.id, name, color, visibility);
  res.status(201).json({ tag: keysToCamel(tag) });
}

async function getTags(req, res) {
  const tags = await tagService.getTagsForUser(req.user.id, req.query.listId);
  res.json({ tags: keysToCamel(tags) });
}

async function updateTag(req, res) {
  const { color, visibility } = req.body;

  if (color !== undefined && !HEX_COLOR.test(color)) {
    return res.status(400).json({ error: 'color must be a hex value like #1a73e8' });
  }
  if (visibility !== undefined && !['private', 'shared'].includes(visibility)) {
    return res.status(400).json({ error: "visibility must be 'private' or 'shared'" });
  }
  if (color === undefined && visibility === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  let tag;
  if (visibility !== undefined) {
    tag = await tagService.setTagVisibility(req.params.tagId, req.user.id, visibility);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
  }

  if (color !== undefined) {
    tag = await tagService.updateTagColor(req.params.tagId, req.user.id, color);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
  }

  res.json({ tag: keysToCamel(tag) });
}

async function deleteTag(req, res) {
  const deleted = await tagService.deleteTag(req.params.tagId, req.user.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Tag not found' });
  }
  res.status(204).end();
}

async function getItemsByTag(req, res) {
  const { tag: tagId } = req.query;
  if (!tagId) {
    return res.status(400).json({ error: 'tag query parameter is required' });
  }

  const tag = await tagService.getTagUsableBy(tagId, req.user.id);
  if (!tag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  const items = await tagService.getItemsByTag(req.user.id, tagId);
  res.json({ items: keysToCamel(items) });
}

async function attachTagToItem(req, res) {
  const { tagId } = req.body;
  if (!tagId) {
    return res.status(400).json({ error: 'tagId is required' });
  }

  const tag = await tagService.getTagUsableInList(tagId, req.user.id, req.list.id);
  if (!tag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  await tagService.attachTag(req.item.id, tagId);
  res.status(204).end();
}

async function detachTagFromItem(req, res) {
  const tag = await tagService.getTagUsableInList(req.params.tagId, req.user.id, req.list.id);
  if (!tag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  const removed = await tagService.detachTag(req.item.id, req.params.tagId);
  if (!removed) {
    return res.status(404).json({ error: 'Tag not attached to this item' });
  }
  res.status(204).end();
}

module.exports = {
  createTag,
  getTags,
  updateTag,
  deleteTag,
  getItemsByTag,
  attachTagToItem,
  detachTagFromItem,
};
