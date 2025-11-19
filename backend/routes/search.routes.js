const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/basic', authenticate, searchController.basicSearch);
router.get('/advanced', authenticate, searchController.advancedSearch);
router.get('/keyword', authenticate, searchController.keywordSearch);
router.get('/by-id/:profileId', authenticate, searchController.searchById);
router.get('/suggestions', authenticate, searchController.getSearchSuggestions);

module.exports = router;
