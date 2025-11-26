const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchedCriteria: [{
    criteria: String,
    matched: Boolean
  }],
  status: {
    type: String,
    enum: ['suggested', 'viewed', 'interested', 'rejected'],
    default: 'suggested'
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

// Compound index to prevent duplicate matches
matchSchema.index({ userId: 1, matchedUserId: 1 }, { unique: true });

matchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Match', matchSchema);
