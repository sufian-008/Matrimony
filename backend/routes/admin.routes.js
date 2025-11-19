const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.patch('/verify/:userId', adminController.verifyProfile);
router.get('/reports', adminController.getReports);
router.patch('/reports/:reportId', adminController.handleReport);
router.get('/payments', adminController.getPayments);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;