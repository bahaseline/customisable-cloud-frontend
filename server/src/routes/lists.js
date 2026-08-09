const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireListAccess, requireListItem } = require('../middleware/loadList');
const { ROLES } = require('../constants/roles');
const listsController = require('../controllers/listsController');
const tagsController = require('../controllers/tagsController');

const router = express.Router();

router.use(requireAuth);

router.post('/', listsController.createList);
router.get('/', listsController.getLists);

// Reading a list: any member. Mutating its contents: editor or owner.
router.get('/:listId', requireListAccess(ROLES.VIEWER), listsController.getListDetail);
router.delete('/:listId', requireListAccess(ROLES.OWNER), listsController.deleteList);

router.post('/:listId/items', requireListAccess(ROLES.EDITOR), listsController.addItem);
router.delete(
  '/:listId/items/:itemId',
  requireListAccess(ROLES.EDITOR),
  requireListItem,
  listsController.removeItem
);
router.post(
  '/:listId/items/:itemId/tags',
  requireListAccess(ROLES.EDITOR),
  requireListItem,
  tagsController.attachTagToItem
);
router.delete(
  '/:listId/items/:itemId/tags/:tagId',
  requireListAccess(ROLES.EDITOR),
  requireListItem,
  tagsController.detachTagFromItem
);

// Membership is owner-managed; any member may see who else has access.
router.get('/:listId/members', requireListAccess(ROLES.VIEWER), listsController.getMembers);
router.post('/:listId/members', requireListAccess(ROLES.OWNER), listsController.addMember);
router.delete('/:listId/members/:userId', requireListAccess(ROLES.OWNER), listsController.removeMember);

module.exports = router;
