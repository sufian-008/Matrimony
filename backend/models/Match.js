const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchDetails: {
    ageScore: Number,
    heightScore: Number,
    locationScore: Number,
    educationScore: Number,
    occupationScore: Number,
    religionScore: Number,
    incomeScore: Number,
    lifestyleScore: Number
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  viewedAt: Date,
  isNotified: {
    type: Boolean,
    default: false
  },
  notifiedAt: Date
}, {
  timestamps: true
});

// Index for efficient querying
matchSchema.index({ userId: 1, matchScore: -1 });
matchSchema.index({ userId: 1, isViewed: 1 });

module.exports = mongoose.model('Match', matchSchema);