const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for finding chats between users
chatSchema.index({ participants: 1 });
chatSchema.index({ 'messages.sender': 1, 'messages.isRead': 1 });

module.exports = mongoose.model('Chat', chatSchema);