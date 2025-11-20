const express = require('express');
const router = express.Router();
const { protect, checkVerified, checkProfileCompleted } = require('../middleware/auth');
const {
  getMatches,
  generateMatches,
  markAsViewed
} = require('../controllers/match.controller');

// Preference routes
const {
  setPreferences,
  getPreferences,
  deletePreferences
} = require('../controllers/preference.controller');

// All routes require authentication, verified email, and completed profile
router.use(protect, checkVerified, checkProfileCompleted);

// Match routes
router.get('/', getMatches);
router.post('/generate', generateMatches);
router.put('/:matchId/view', markAsViewed);

// Preference routes
router.route('/preferences')
  .get(getPreferences)
  .post(setPreferences)
  .delete(deletePreferences);

module.exports = router;