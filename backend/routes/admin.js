const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.put('/users/:userId/suspend', adminController.suspendUser);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/profiles', adminController.getAllProfiles);
router.put('/profiles/:profileId/verify', adminController.verifyProfile);
router.get('/reports', adminController.getAllReports);
router.put('/reports/:reportId', adminController.updateReport);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
