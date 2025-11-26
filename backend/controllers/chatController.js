const Chat = require('../models/Chat');
const Profile = require('../models/Profile');

// @desc    Get all conversations
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
    .populate('participants', 'email')
    .sort({ 'lastMessage.sentAt': -1 });

    // Get profile information for each conversation
    const conversations = await Promise.all(
      chats.map(async (chat) => {
        // Find the other participant
        const otherParticipant = chat.participants.find(
          p => p && p._id && p._id.toString() !== req.user.id
        );
        
        // Skip if no other participant found
        if (!otherParticipant) {
          return null;
        }
        
        const otherUserId = otherParticipant._id;

        const profile = await Profile.findOne({ 
          userId: otherUserId 
        }).select('profileId personalInfo photos');

        // Count unread messages
        const unreadCount = chat.messages.filter(
          msg => msg.receiverId.toString() === req.user.id && !msg.isRead
        ).length;

        return {
          chatId: chat._id,
          profile,
          otherUserId: otherUserId.toString(),
          lastMessage: chat.lastMessage,
          unreadCount,
          updatedAt: chat.updatedAt
        };
      })
    );
    
    // Filter out null conversations
    const validConversations = conversations.filter(c => c !== null);

    res.status(200).json({
      success: true,
      data: validConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get messages with a user
// @route   GET /api/chat/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, userId] }
    }).populate('participants', 'email');

    if (!chat) {
      return res.status(200).json({
        success: true,
        data: {
          messages: [],
          pagination: {
            total: 0,
            page: 1,
            pages: 0
          }
        }
      });
    }

    // Pagination for messages
    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - (page * limit));
    const endIndex = totalMessages - ((page - 1) * limit);
    
    const messages = chat.messages.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        chatId: chat._id,
        messages,
        pagination: {
          total: totalMessages,
          page: parseInt(page),
          pages: Math.ceil(totalMessages / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/send
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message, messageType = 'text' } = req.body;

    console.log('Send message request:', { receiverId, message, messageType, userId: req.user.id });

    if (!receiverId || !message) {
      console.log('Missing data - receiverId:', receiverId, 'message:', message);
      return res.status(400).json({
        success: false,
        message: 'Please provide receiver and message'
      });
    }

    // Find or create chat
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });

    const newMessage = {
      senderId: req.user.id,
      receiverId,
      message,
      messageType,
      sentAt: new Date()
    };

    if (chat) {
      chat.messages.push(newMessage);
      chat.lastMessage = {
        text: message,
        sentAt: new Date(),
        senderId: req.user.id
      };
      await chat.save();
    } else {
      chat = await Chat.create({
        participants: [req.user.id, receiverId],
        messages: [newMessage],
        lastMessage: {
          text: message,
          sentAt: new Date(),
          senderId: req.user.id
        }
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('receive-message', {
        chatId: chat._id,
        message: newMessage,
        senderId: req.user.id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/mark-read/:chatId
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Mark all messages from other user as read
    chat.messages.forEach(msg => {
      if (msg.receiverId.toString() === req.user.id && !msg.isRead) {
        msg.isRead = true;
        msg.readAt = new Date();
      }
    });

    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
