const express = require('express');
const router = express.Router();
const { protect, checkVerified, checkProfileCompleted } = require('../middleware/auth');
const {
  sendInterest,
  respondToInterest,
  getSentInterests,
  getReceivedInterests,
  addToShortlist,
  removeFromShortlist,
  getShortlist,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getChats,
  getChatMessages,
  sendMessage,
  markAsRead
} = require('../controllers/interaction.controller');

// Report routes
const { reportUser, getMyReports } = require('../controllers/report.controller');

// All routes require authentication, verified email, and completed profile
router.use(protect, checkVerified, checkProfileCompleted);

// Interest routes
router.post('/interest/:userId', sendInterest);
router.put('/interest/:interestId', respondToInterest);
router.get('/interests/sent', getSentInterests);
router.get('/interests/received', getReceivedInterests);

// Shortlist routes
router.post('/shortlist/:userId', addToShortlist);
router.delete('/shortlist/:userId', removeFromShortlist);
router.get('/shortlist', getShortlist);

// Block routes
router.post('/block/:userId', blockUser);
router.delete('/block/:userId', unblockUser);
router.get('/blocked', getBlockedUsers);

// Chat routes
router.get('/chats', getChats);
router.get('/chats/:chatId', getChatMessages);
router.post('/chats/:chatId/messages', sendMessage);
router.put('/chats/:chatId/read', markAsRead);

// Report routes
router.post('/report/:userId', reportUser);
router.get('/reports/my-reports', getMyReports);

module.exports = router;