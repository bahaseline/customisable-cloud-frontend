const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getFiles, getFileById, streamFileContent } = require('../controllers/filesController');

const router = express.Router();

router.get('/', requireAuth, getFiles);
router.get('/:fileId', requireAuth, getFileById);
router.get('/:fileId/content', requireAuth, streamFileContent);

module.exports = router;
