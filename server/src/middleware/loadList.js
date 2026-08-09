const listService = require('../services/listService');
const { ROLES, satisfies } = require('../constants/roles');

function requireListAccess(minRole = ROLES.VIEWER) {
  return async function loadList(req, res, next) {
    const list = await listService.getListAccess(req.params.listId, req.user.id);

    // Hides the existence of lists the user cannot see at all: 404, never 403.
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (!satisfies(list.role, minRole)) {
      return res.status(403).json({ error: `This action requires ${minRole} access` });
    }

    req.list = list;
    req.listRole = list.role;
    next();
  };
}

async function requireListItem(req, res, next) {
  const item = await listService.getItemInList(req.params.listId, req.params.itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  req.item = item;
  next();
}

module.exports = { requireListAccess, requireListItem };
