const listService = require('../services/listService');
const userService = require('../services/userService');
const { keysToCamel } = require('../utils/camelCase');
const { ROLES, ASSIGNABLE_ROLES } = require('../constants/roles');

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

async function getMembers(req, res) {
  const members = await listService.getMembersForList(req.list.id);
  res.json({ members: keysToCamel(members) });
}

async function addMember(req, res) {
  const { email, role = ROLES.VIEWER } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }
  if (!ASSIGNABLE_ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${ASSIGNABLE_ROLES.join(', ')}` });
  }

  const user = await userService.getUserByEmail(email);
  if (!user) {
    return res
      .status(404)
      .json({ error: 'No Driveboard account with that email. They need to sign in once first.' });
  }
  if (user.id === req.list.owner_id) {
    return res.status(400).json({ error: 'The list owner already has full access' });
  }

  const member = await listService.addMember(req.list.id, user.id, role);
  res.status(201).json({
    member: keysToCamel({ ...member, email: user.email, name: user.name }),
  });
}

async function removeMember(req, res) {
  const removed = await listService.removeMember(req.list.id, req.params.userId);
  if (!removed) {
    return res.status(404).json({ error: 'Member not found' });
  }
  res.status(204).end();
}

module.exports = {
  createList,
  getLists,
  getListDetail,
  deleteList,
  addItem,
  removeItem,
  getMembers,
  addMember,
  removeMember,
};
