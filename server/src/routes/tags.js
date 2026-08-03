const express = require('express');
const { requireAuth } = require('../middleware/auth');
const tagsController = require('../controllers/tagsController');

const router = express.Router();

router.use(requireAuth);

router.post('/', tagsController.createTag);
router.get('/', tagsController.getTags);
router.put('/:tagId', tagsController.updateTagColor);
router.delete('/:tagId', tagsController.deleteTag);

module.exports = router;
