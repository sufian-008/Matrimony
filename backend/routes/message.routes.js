const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate, checkSubscription } = require('../middleware/auth.middleware');

router.post('/send', authenticate, checkSubscription('basic'), messageController.sendMessage);
router.get('/conversations', authenticate, messageController.getConversations);
router.get('/conversation/:conversationId', authenticate, messageController.getMessages);
router.patch('/:messageId/read', authenticate, messageController.markAsRead);
router.delete('/:messageId', authenticate, messageController.deleteMessage);

module.exports = router;