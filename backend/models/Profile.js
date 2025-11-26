const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profileId: {
    type: String,
    unique: true
  },
  
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    maritalStatus: { 
      type: String, 
      enum: ['never_married', 'divorced', 'widowed', 'separated'],
      required: true 
    },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    bodyType: { 
      type: String, 
      enum: ['slim', 'average', 'athletic', 'heavy'] 
    },
    complexion: { 
      type: String, 
      enum: ['fair', 'wheatish', 'dark', 'very_fair'] 
    },
    physicalStatus: { 
      type: String, 
      enum: ['normal', 'physically_challenged'],
      default: 'normal'
    },
    bloodGroup: { 
      type: String, 
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
    },
    motherTongue: { type: String },
    bio: { type: String, maxlength: 500 }
  },

  // Professional Information
  professionalInfo: {
    education: { type: String, required: true },
    educationDetails: { type: String },
    occupation: { type: String, required: true },
    occupationDetails: { type: String },
    employedIn: { 
      type: String, 
      enum: ['government', 'private', 'business', 'self_employed', 'not_working'] 
    },
    annualIncome: { type: String },
    workLocation: { type: String }
  },

  // Family Information
  familyInfo: {
    fatherName: { type: String },
    fatherOccupation: { type: String },
    motherName: { type: String },
    motherOccupation: { type: String },
    siblings: { type: Number, default: 0 },
    familyType: { 
      type: String, 
      enum: ['nuclear', 'joint'] 
    },
    familyStatus: { 
      type: String, 
      enum: ['middle_class', 'upper_middle_class', 'rich', 'affluent'] 
    },
    familyValues: { 
      type: String, 
      enum: ['traditional', 'moderate', 'liberal'] 
    },
    familyLocation: { type: String }
  },

  // Location Information
  location: {
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String }
  },

  // Religious Information
  religiousInfo: {
    religion: { type: String, required: true },
    caste: { type: String },
    subCaste: { type: String },
    gotra: { type: String },
    dosham: { 
      type: String, 
      enum: ['yes', 'no', 'dont_know'] 
    },
    star: { type: String }
  },

  // Lifestyle & Hobbies
  lifestyle: {
    diet: { 
      type: String, 
      enum: ['vegetarian', 'non_vegetarian', 'eggetarian'] 
    },
    smoking: { 
      type: String, 
      enum: ['yes', 'no', 'occasionally'] 
    },
    drinking: { 
      type: String, 
      enum: ['yes', 'no', 'occasionally'] 
    },
    hobbies: [{ type: String }],
    interests: [{ type: String }]
  },

  // Photos and Documents
  photos: [{
    url: { type: String },
    isProfile: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  documents: [{
    type: { 
      type: String, 
      enum: ['id_proof', 'address_proof', 'education_certificate', 'income_proof'] 
    },
    url: { type: String },
    isVerified: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Privacy Settings
  privacy: {
    showPhone: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false },
    showPhotos: { 
      type: String, 
      enum: ['all', 'premium', 'none'],
      default: 'premium' 
    },
    profileVisibility: { 
      type: String, 
      enum: ['public', 'private'],
      default: 'public' 
    }
  },

  // Profile Stats
  stats: {
    views: { type: Number, default: 0 },
    contactViews: { type: Number, default: 0 },
    shortlists: { type: Number, default: 0 }
  },

  // Verification Status
  verification: {
    idVerified: { type: Boolean, default: false },
    photoVerified: { type: Boolean, default: false },
    educationVerified: { type: Boolean, default: false },
    incomeVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  },

  // Profile Status
  profileCompleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  premiumExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate unique profile ID
profileSchema.pre('save', async function(next) {
  if (!this.profileId) {
    try {
      // Find the highest existing profileId
      const lastProfile = await mongoose.model('Profile')
        .findOne({}, { profileId: 1 })
        .sort({ profileId: -1 })
        .lean();
      
      let nextNumber = 10001;
      if (lastProfile && lastProfile.profileId) {
        // Extract number from profileId (e.g., "MAT010004" -> 10004)
        const lastNumber = parseInt(lastProfile.profileId.replace('MAT', ''));
        nextNumber = lastNumber + 1;
      }
      
      this.profileId = `MAT${String(nextNumber).padStart(6, '0')}`;
    } catch (error) {
      console.error('Error generating profileId:', error);
      // Fallback to timestamp-based ID if there's an error
      this.profileId = `MAT${Date.now().toString().slice(-6)}`;
    }
  }
  this.updatedAt = Date.now();
  next();
});

// Virtual properties for backward compatibility
profileSchema.virtual('firstName').get(function() {
  return this.personalInfo?.firstName;
});

profileSchema.virtual('lastName').get(function() {
  return this.personalInfo?.lastName;
});

profileSchema.virtual('gender').get(function() {
  return this.personalInfo?.gender;
});

profileSchema.virtual('age').get(function() {
  if (this.personalInfo?.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.personalInfo.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

profileSchema.virtual('profilePhoto').get(function() {
  if (this.photos && this.photos.length > 0) {
    const profilePhoto = this.photos.find(p => p.isProfile);
    return profilePhoto ? profilePhoto.url : this.photos[0].url;
  }
  return '/default-avatar.png';
});

profileSchema.virtual('education').get(function() {
  return this.professionalInfo?.education;
});

profileSchema.virtual('occupation').get(function() {
  return this.professionalInfo?.occupation;
});

profileSchema.virtual('city').get(function() {
  return this.location?.city;
});

profileSchema.virtual('state').get(function() {
  return this.location?.state;
});

profileSchema.virtual('country').get(function() {
  return this.location?.country;
});

profileSchema.virtual('religion').get(function() {
  return this.religiousInfo?.religion;
});

profileSchema.virtual('height').get(function() {
  return this.personalInfo?.height;
});

profileSchema.virtual('maritalStatus').get(function() {
  return this.personalInfo?.maritalStatus;
});

// Ensure virtuals are included when converting to JSON
profileSchema.set('toJSON', { virtuals: true });
profileSchema.set('toObject', { virtuals: true });

// Index for better search performance
profileSchema.index({ 'personalInfo.gender': 1, 'location.country': 1, 'location.state': 1 });

module.exports = mongoose.model('Profile', profileSchema);
