const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireOwnedList, requireListItem } = require('../middleware/loadList');
const listsController = require('../controllers/listsController');
const tagsController = require('../controllers/tagsController');

const router = express.Router();

router.use(requireAuth);

router.post('/', listsController.createList);
router.get('/', listsController.getLists);
router.get('/:listId', requireOwnedList, listsController.getListDetail);
router.delete('/:listId', requireOwnedList, listsController.deleteList);
router.post('/:listId/items', requireOwnedList, listsController.addItem);
router.delete('/:listId/items/:itemId', requireOwnedList, requireListItem, listsController.removeItem);
router.post(
  '/:listId/items/:itemId/tags',
  requireOwnedList,
  requireListItem,
  tagsController.attachTagToItem
);
router.delete(
  '/:listId/items/:itemId/tags/:tagId',
  requireOwnedList,
  requireListItem,
  tagsController.detachTagFromItem
);

module.exports = router;
