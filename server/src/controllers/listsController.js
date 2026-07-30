const listService = require('../services/listService');
const { keysToCamel } = require('../utils/camelCase');

async function createList(req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const list = await listService.createList(req.user.id, name);
  res.status(201).json({ list: keysToCamel(list) });
}

async function getLists(req, res) {
  const lists = await listService.getListsForUser(req.user.id);
  res.json({ lists: keysToCamel(lists) });
}

async function getListDetail(req, res) {
  const items = await listService.getItemsForList(req.list.id);
  res.json({ list: keysToCamel(req.list), items: keysToCamel(items) });
}

async function deleteList(req, res) {
  await listService.deleteList(req.list.id, req.user.id);
  res.status(204).end();
}

async function addItem(req, res) {
  const { driveFileId, fileName } = req.body;
  if (!driveFileId) {
    return res.status(400).json({ error: 'driveFileId is required' });
  }

  const item = await listService.addItem(req.list.id, {
    driveFileId,
    fileName,
    addedBy: req.user.id,
  });
  res.status(201).json({ item: keysToCamel(item) });
}

async function removeItem(req, res) {
  await listService.removeItem(req.list.id, req.item.id);
  res.status(204).end();
}

module.exports = { createList, getLists, getListDetail, deleteList, addItem, removeItem };
