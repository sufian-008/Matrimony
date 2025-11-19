const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Details
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  age: {
    type: Number
  },
  maritalStatus: {
    type: String,
    enum: ['never_married', 'divorced', 'widowed', 'separated'],
    required: true
  },
  height: {
    type: Number, // in cm
    required: true
  },
  weight: {
    type: Number // in kg
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  physicalStatus: {
    type: String,
    enum: ['normal', 'physically_challenged'],
    default: 'normal'
  },
  complexion: {
    type: String,
    enum: ['very_fair', 'fair', 'wheatish', 'dark']
  },
  
  // Contact Details
  phone: {
    type: String,
    required: true
  },
  alternatePhone: String,
  
  // Location
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  pincode: String,
  
  // Religion & Caste
  religion: {
    type: String,
    required: true
  },
  caste: String,
  subCaste: String,
  motherTongue: {
    type: String,
    required: true
  },
  
  // Education & Career
  education: {
    type: String,
    required: true
  },
  educationDetails: String,
  occupation: {
    type: String,
    required: true
  },
  occupationDetails: String,
  employedIn: {
    type: String,
    enum: ['government', 'private', 'business', 'self_employed', 'not_working']
  },
  annualIncome: {
    type: String
  },
  
  // Family Details
  fatherName: String,
  fatherOccupation: String,
  motherName: String,
  motherOccupation: String,
  siblings: {
    brothers: { type: Number, default: 0 },
    sisters: { type: Number, default: 0 },
    marriedBrothers: { type: Number, default: 0 },
    marriedSisters: { type: Number, default: 0 }
  },
  familyType: {
    type: String,
    enum: ['joint', 'nuclear']
  },
  familyStatus: {
    type: String,
    enum: ['middle_class', 'upper_middle_class', 'rich', 'affluent']
  },
  familyValues: {
    type: String,
    enum: ['traditional', 'moderate', 'liberal']
  },
  
  // Lifestyle
  diet: {
    type: String,
    enum: ['vegetarian', 'non_vegetarian', 'eggetarian']
  },
  smoking: {
    type: String,
    enum: ['no', 'occasionally', 'yes']
  },
  drinking: {
    type: String,
    enum: ['no', 'occasionally', 'yes']
  },
  
  // About
  about: {
    type: String,
    maxlength: 1000
  },
  hobbies: [String],
  
  // Photos
  profilePhoto: {
    type: String,
    required: true
  },
  photos: [{
    url: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['id_proof', 'education', 'income', 'other']
    },
    url: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Profile Settings
  profileVisibility: {
    type: String,
    enum: ['public', 'members_only', 'premium_only'],
    default: 'public'
  },
  showContactDetails: {
    type: Boolean,
    default: false
  },
  
  // Verification Status
  isProfileVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Stats
  profileViews: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate age from date of birth
profileSchema.pre('save', function(next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.age = age;
  }
  next();
});

// Index for search optimization
profileSchema.index({ gender: 1, age: 1, maritalStatus: 1 });
profileSchema.index({ religion: 1, caste: 1 });
profileSchema.index({ city: 1, state: 1, country: 1 });
profileSchema.index({ education: 1, occupation: 1 });

module.exports = mongoose.model('Profile', profileSchema);