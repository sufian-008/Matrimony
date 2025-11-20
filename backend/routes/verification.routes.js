const express = require('express');
const router = express.Router();
const { protect, authorize, checkVerified } = require('../middleware/auth');
const {
  submitForVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getVerificationStatus
} = require('../controllers/verification.controller');

// User routes
router.post('/submit', protect, checkVerified, submitForVerification);
router.get('/status', protect, checkVerified, getVerificationStatus);

// Admin routes
router.get('/pending', protect, authorize('admin'), getPendingVerifications);
router.put('/:profileId/approve', protect, authorize('admin'), approveVerification);
router.put('/:profileId/reject', protect, authorize('admin'), rejectVerification);

module.exports = router;