const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['shortlist', 'interest', 'block'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500
  },
  respondedAt: Date
}, {
  timestamps: true
});

// Compound index to prevent duplicate interactions
interactionSchema.index({ fromUser: 1, toUser: 1, type: 1 }, { unique: true });
interactionSchema.index({ toUser: 1, status: 1, type: 1 });

module.exports = mongoose.model('Interaction', interactionSchema);