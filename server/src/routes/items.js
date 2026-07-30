const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getItemsByTag } = require('../controllers/tagsController');

const router = express.Router();

router.get('/', requireAuth, getItemsByTag);

module.exports = router;
