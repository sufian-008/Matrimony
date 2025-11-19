const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Preferences
  lookingFor: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  ageFrom: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  ageTo: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  heightFrom: {
    type: Number, // in cm
    required: true
  },
  heightTo: {
    type: Number, // in cm
    required: true
  },
  maritalStatus: [{
    type: String,
    enum: ['never_married', 'divorced', 'widowed', 'separated']
  }],
  
  // Location Preferences
  countries: [String],
  states: [String],
  cities: [String],
  
  // Religion & Community
  religions: [String],
  castes: [String],
  motherTongues: [String],
  
  // Education & Career
  educations: [String],
  occupations: [String],
  annualIncomeFrom: String,
  annualIncomeTo: String,
  
  // Lifestyle
  diet: [{
    type: String,
    enum: ['vegetarian', 'non_vegetarian', 'eggetarian']
  }],
  smoking: [{
    type: String,
    enum: ['no', 'occasionally', 'yes']
  }],
  drinking: [{
    type: String,
    enum: ['no', 'occasionally', 'yes']
  }],
  
  // Additional Preferences
  physicalStatus: {
    type: String,
    enum: ['any', 'normal', 'physically_challenged'],
    default: 'any'
  },
  
  // Preferences Weight (for matching algorithm)
  weights: {
    age: { type: Number, default: 10 },
    height: { type: Number, default: 5 },
    location: { type: Number, default: 8 },
    education: { type: Number, default: 7 },
    occupation: { type: Number, default: 6 },
    religion: { type: Number, default: 9 },
    income: { type: Number, default: 5 },
    lifestyle: { type: Number, default: 4 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Preference', preferenceSchema);