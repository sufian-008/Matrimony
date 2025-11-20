const Interaction = require('../models/Interaction');
const Chat = require('../models/Chat');
const Profile = require('../models/Profile');
const User = require('../models/User');
const emailService = require('../utils/emailService');

// @desc    Send interest
// @route   POST /api/interactions/interest/:userId
// @access  Private
exports.sendInterest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send interest to yourself'
      });
    }

    // Check if already sent
    const existing = await Interaction.findOne({
      fromUser: req.user.id,
      toUser: userId,
      type: 'interest'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Interest already sent'
      });
    }

    // Create interest
    const interest = await Interaction.create({
      fromUser: req.user.id,
      toUser: userId,
      type: 'interest',
      message,
      status: 'pending'
    });

    // Send notification email
    try {
      const fromProfile = await Profile.findOne({ userId: req.user.id });
      const toUser = await User.findById(userId);
      
      if (fromProfile && toUser) {
        await emailService.sendInterestNotification(
          toUser.email,
          `${fromProfile.firstName} ${fromProfile.lastName}`
        );
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Interest sent successfully',
      data: interest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to interest
// @route   PUT /api/interactions/interest/:interestId
// @access  Private
exports.respondToInterest = async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    const interest = await Interaction.findOne({
      _id: req.params.interestId,
      toUser: req.user.id,
      type: 'interest'
    });

    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }

    interest.status = status;
    interest.respondedAt = Date.now();
    await interest.save();

    // If accepted, create a chat
    if (status === 'accepted') {
      const existingChat = await Chat.findOne({
        participants: { $all: [req.user.id, interest.fromUser] }
      });

      if (!existingChat) {
        await Chat.create({
          participants: [req.user.id, interest.fromUser],
          messages: []
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Interest ${status}`,
      data: interest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent interests
// @route   GET /api/interactions/interests/sent
// @access  Private
exports.getSentInterests = async (req, res, next) => {
  try {
    const interests = await Interaction.find({
      fromUser: req.user.id,
      type: 'interest'
    })
      .populate('toUser', 'email isVerified')
      .sort({ createdAt: -1 });

    // Get profiles
    const interestsWithProfiles = await Promise.all(
      interests.map(async (interest) => {
        const profile = await Profile.findOne({ userId: interest.toUser });
        return {
          ...interest.toObject(),
          profile
        };
      })
    );

    res.status(200).json({
      success: true,
      data: interestsWithProfiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get received interests
// @route   GET /api/interactions/interests/received
// @access  Private
exports.getReceivedInterests = async (req, res, next) => {
  try {
    const interests = await Interaction.find({
      toUser: req.user.id,
      type: 'interest'
    })
      .populate('fromUser', 'email isVerified')
      .sort({ createdAt: -1 });

    // Get profiles
    const interestsWithProfiles = await Promise.all(
      interests.map(async (interest) => {
        const profile = await Profile.findOne({ userId: interest.fromUser });
        return {
          ...interest.toObject(),
          profile
        };
      })
    );

    res.status(200).json({
      success: true,
      data: interestsWithProfiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to shortlist
// @route   POST /api/interactions/shortlist/:userId
// @access  Private
exports.addToShortlist = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot shortlist yourself'
      });
    }

    // Check if already shortlisted
    const existing = await Interaction.findOne({
      fromUser: req.user.id,
      toUser: userId,
      type: 'shortlist'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already in shortlist'
      });
    }

    const shortlist = await Interaction.create({
      fromUser: req.user.id,
      toUser: userId,
      type: 'shortlist'
    });

    res.status(201).json({
      success: true,
      message: 'Added to shortlist',
      data: shortlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from shortlist
// @route   DELETE /api/interactions/shortlist/:userId
// @access  Private
exports.removeFromShortlist = async (req, res, next) => {
  try {
    const shortlist = await Interaction.findOneAndDelete({
      fromUser: req.user.id,
      toUser: req.params.userId,
      type: 'shortlist'
    });

    if (!shortlist) {
      return res.status(404).json({
        success: false,
        message: 'Not in shortlist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from shortlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shortlist
// @route   GET /api/interactions/shortlist
// @access  Private
exports.getShortlist = async (req, res, next) => {
  try {
    const shortlist = await Interaction.find({
      fromUser: req.user.id,
      type: 'shortlist'
    })
      .populate('toUser', 'email isVerified')
      .sort({ createdAt: -1 });

    // Get profiles
    const shortlistWithProfiles = await Promise.all(
      shortlist.map(async (item) => {
        const profile = await Profile.findOne({ userId: item.toUser });
        return {
          ...item.toObject(),
          profile
        };
      })
    );

    res.status(200).json({
      success: true,
      data: shortlistWithProfiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block user
// @route   POST /api/interactions/block/:userId
// @access  Private
exports.blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself'
      });
    }

    const existing = await Interaction.findOne({
      fromUser: req.user.id,
      toUser: userId,
      type: 'block'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User already blocked'
      });
    }

    const block = await Interaction.create({
      fromUser: req.user.id,
      toUser: userId,
      type: 'block'
    });

    res.status(201).json({
      success: true,
      message: 'User blocked',
      data: block
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock user
// @route   DELETE /api/interactions/block/:userId
// @access  Private
exports.unblockUser = async (req, res, next) => {
  try {
    const block = await Interaction.findOneAndDelete({
      fromUser: req.user.id,
      toUser: req.params.userId,
      type: 'block'
    });

    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'User not blocked'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User unblocked'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blocked users
// @route   GET /api/interactions/blocked
// @access  Private
exports.getBlockedUsers = async (req, res, next) => {
  try {
    const blocked = await Interaction.find({
      fromUser: req.user.id,
      type: 'block'
    })
      .populate('toUser', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blocked
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chats
// @route   GET /api/interactions/chats
// @access  Private
exports.getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'email isVerified')
      .sort({ 'lastMessage.createdAt': -1 });

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat messages
// @route   GET /api/interactions/chats/:chatId
// @access  Private
exports.getChatMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.id
    }).populate('participants', 'email');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/interactions/chats/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const message = {
      sender: req.user.id,
      content,
      createdAt: Date.now()
    };

    chat.messages.push(message);
    chat.lastMessage = {
      content,
      sender: req.user.id,
      createdAt: Date.now()
    };

    await chat.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/interactions/chats/:chatId/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Mark all messages from other user as read
    chat.messages.forEach((message) => {
      if (message.sender.toString() !== req.user.id.toString() && !message.isRead) {
        message.isRead = true;
        message.readAt = Date.now();
      }
    });

    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};