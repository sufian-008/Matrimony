const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.get('/suggestions', protect, matchController.getMatchSuggestions);
router.post('/calculate/:profileId', protect, matchController.calculateMatch);
router.get('/my-matches', protect, matchController.getMyMatches);

module.exports = router;
