const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard,
  getAllUsers,
  getUserDetails,
  toggleBlockUser,
  deleteUser,
  getReports,
  reviewReport,
  getAnalytics
} = require('../controllers/admin.controller');

// All routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId/block', toggleBlockUser);
router.delete('/users/:userId', deleteUser);

// Report management
router.get('/reports', getReports);
router.put('/reports/:reportId', reviewReport);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;