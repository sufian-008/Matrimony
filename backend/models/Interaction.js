const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interactionType: {
    type: String,
    enum: ['interest', 'shortlist', 'favorite', 'block', 'view'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'active', 'removed'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for faster queries
interactionSchema.index({ fromUserId: 1, toUserId: 1, interactionType: 1 });
interactionSchema.index({ toUserId: 1, interactionType: 1, status: 1 });

interactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Interaction', interactionSchema);
