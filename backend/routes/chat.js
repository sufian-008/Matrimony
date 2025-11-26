const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, chatController.getConversations);
router.get('/:userId', protect, chatController.getMessages);
router.post('/send', protect, chatController.sendMessage);
router.put('/mark-read/:chatId', protect, chatController.markAsRead);

module.exports = router;
