const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getFiles, getFileById } = require('../controllers/filesController');

const router = express.Router();

router.get('/', requireAuth, getFiles);
router.get('/:fileId', requireAuth, getFileById);

module.exports = router;
