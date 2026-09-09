const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getFiles,
  getFileById,
  getFrequentFiles,
  streamFileContent,
} = require('../controllers/filesController');

const router = express.Router();

router.get('/', requireAuth, getFiles);
// Declared before /:fileId, or "frequent" would be read as a file id.
router.get('/frequent', requireAuth, getFrequentFiles);
router.get('/:fileId', requireAuth, getFileById);
router.get('/:fileId/content', requireAuth, streamFileContent);

module.exports = router;
