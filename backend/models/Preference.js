const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Basic Preferences
  ageRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  heightRange: {
    min: { type: Number }, // in cm
    max: { type: Number }
  },
  maritalStatus: [{
    type: String,
    enum: ['never_married', 'divorced', 'widowed', 'separated']
  }],

  // Location Preferences
  location: {
    countries: [{ type: String }],
    states: [{ type: String }],
    cities: [{ type: String }]
  },

  // Religious Preferences
  religion: [{ type: String }],
  caste: [{ type: String }],
  dosham: { 
    type: String, 
    enum: ['yes', 'no', 'doesnt_matter'],
    default: 'doesnt_matter'
  },

  // Professional Preferences
  education: [{ type: String }],
  occupation: [{ type: String }],
  employedIn: [{
    type: String,
    enum: ['government', 'private', 'business', 'self_employed', 'not_working']
  }],
  annualIncome: {
    min: { type: String },
    max: { type: String }
  },

  // Lifestyle Preferences
  diet: [{
    type: String,
    enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'doesnt_matter']
  }],
  smoking: {
    type: String,
    enum: ['acceptable', 'not_acceptable', 'doesnt_matter'],
    default: 'doesnt_matter'
  },
  drinking: {
    type: String,
    enum: ['acceptable', 'not_acceptable', 'doesnt_matter'],
    default: 'doesnt_matter'
  },

  // Additional Preferences
  familyType: [{
    type: String,
    enum: ['nuclear', 'joint', 'doesnt_matter']
  }],
  familyStatus: [{
    type: String,
    enum: ['middle_class', 'upper_middle_class', 'rich', 'affluent']
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

preferenceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Preference', preferenceSchema);
