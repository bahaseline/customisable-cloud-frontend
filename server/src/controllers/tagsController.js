const tagService = require('../services/tagService');
const { keysToCamel } = require('../utils/camelCase');

async function createTag(req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const tag = await tagService.createTag(req.user.id, name);
  res.status(201).json({ tag: keysToCamel(tag) });
}

async function getTags(req, res) {
  const tags = await tagService.getTagsForUser(req.user.id);
  res.json({ tags: keysToCamel(tags) });
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

  const tag = await tagService.getTagOwnedBy(tagId, req.user.id);
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

  const tag = await tagService.getTagOwnedBy(tagId, req.user.id);
  if (!tag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  await tagService.attachTag(req.item.id, tagId);
  res.status(204).end();
}

async function detachTagFromItem(req, res) {
  const removed = await tagService.detachTag(req.item.id, req.params.tagId);
  if (!removed) {
    return res.status(404).json({ error: 'Tag not attached to this item' });
  }
  res.status(204).end();
}

module.exports = { createTag, getTags, deleteTag, getItemsByTag, attachTagToItem, detachTagFromItem };
