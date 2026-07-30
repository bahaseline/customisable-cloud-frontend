const listService = require('../services/listService');

async function requireOwnedList(req, res, next) {
  const list = await listService.getListOwnedBy(req.params.listId, req.user.id);
  if (!list) {
    return res.status(404).json({ error: 'List not found' });
  }
  req.list = list;
  next();
}

async function requireListItem(req, res, next) {
  const item = await listService.getItemInList(req.params.listId, req.params.itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  req.item = item;
  next();
}

module.exports = { requireOwnedList, requireListItem };
