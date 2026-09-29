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
// Renaming / deleting the list itself: owner only.
router.get('/:listId', requireListAccess(ROLES.VIEWER), listsController.getListDetail);
router.put('/:listId', requireListAccess(ROLES.OWNER), listsController.renameList);
router.delete('/:listId', requireListAccess(ROLES.OWNER), listsController.deleteList);

router.post('/:listId/items', requireListAccess(ROLES.EDITOR), listsController.addItem);
router.delete(
  '/:listId/items/:itemId',
  requireListAccess(ROLES.EDITOR),
  requireListItem,
  listsController.removeItem
);
// Personal labels: any list member may attach/detach their own tags.
// Ownership of the tag is enforced in the controller.
router.post(
  '/:listId/items/:itemId/tags',
  requireListAccess(ROLES.VIEWER),
  requireListItem,
  tagsController.attachTagToItem
);
router.delete(
  '/:listId/items/:itemId/tags/:tagId',
  requireListAccess(ROLES.VIEWER),
  requireListItem,
  tagsController.detachTagFromItem
);

// Membership is owner-managed; any member may see who else has access.
router.get('/:listId/members', requireListAccess(ROLES.VIEWER), listsController.getMembers);
router.post('/:listId/members', requireListAccess(ROLES.OWNER), listsController.addMember);
router.put('/:listId/members/:userId', requireListAccess(ROLES.OWNER), listsController.updateMember);
router.delete('/:listId/members/:userId', requireListAccess(ROLES.OWNER), listsController.removeMember);

module.exports = router;
