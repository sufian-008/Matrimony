const express = require('express');
const router = express.Router();
const { protect, checkVerified, checkProfileCompleted } = require('../middleware/auth');
const {
  searchProfiles,
  searchById,
  advancedSearch,
  getRecentProfiles
} = require('../controllers/search.controller');

// All routes require authentication, verified email, and completed profile
router.use(protect, checkVerified, checkProfileCompleted);

router.get('/', searchProfiles);
router.get('/id/:profileId', searchById);
router.post('/advanced', advancedSearch);
router.get('/recent', getRecentProfiles);

module.exports = router;