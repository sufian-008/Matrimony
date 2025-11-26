const Profile = require('../models/Profile');
const Preference = require('../models/Preference');
const Interaction = require('../models/Interaction');

// @desc    Create profile
// @route   POST /api/profile/create
// @access  Private
exports.createProfile = async (req, res) => {
  try {
    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists'
      });
    }

    const profileData = {
      userId: req.user.id,
      ...req.body,
      // Set default privacy to public and profile as active
      privacy: {
        ...req.body.privacy,
        profileVisibility: req.body.privacy?.profileVisibility || 'public'
      },
      isActive: true,
      profileCompleted: true
    };

    const profile = await Profile.create(profileData);

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my profile
// @route   GET /api/profile/my-profile
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update profile
// @route   PUT /api/profile/update
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        profile[key] = req.body[key];
      }
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get profile by ID
// @route   GET /api/profile/:profileId
// @access  Private
exports.getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ profileId: req.params.profileId })
      .populate('userId', 'email phone');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check privacy settings
    if (profile.privacy.profileVisibility === 'private' && 
        profile.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload photo
// @route   POST /api/profile/upload-photo
// @access  Private
exports.uploadPhoto = async (req, res) => {
  try {
    console.log('Upload photo request received');
    console.log('File info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      filename: req.file.filename
    } : 'No file');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a photo'
      });
    }

    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Use Cloudinary URL if available (production), otherwise local path
    // For Cloudinary, req.file.path contains the full Cloudinary URL
    const photoUrl = req.file.path || `/uploads/${req.file.filename}`;
    
    console.log('Photo URL to save:', photoUrl);

    profile.photos.push({
      url: photoUrl,
      isProfile: profile.photos.length === 0,
      uploadedAt: new Date()
    });

    await profile.save();
    
    console.log('Photo saved successfully to profile');

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: profile.photos[profile.photos.length - 1]
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete photo
// @route   DELETE /api/profile/photo/:photoId
// @access  Private
exports.deletePhoto = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.photos = profile.photos.filter(
      photo => photo._id.toString() !== req.params.photoId
    );

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload document
// @route   POST /api/profile/upload-document
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document'
      });
    }

    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Please specify document type'
      });
    }

    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const documentUrl = `/uploads/${req.file.filename}`;

    profile.documents.push({
      type,
      url: documentUrl,
      uploadedAt: new Date()
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: profile.documents[profile.documents.length - 1]
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update privacy settings
// @route   PUT /api/profile/privacy
// @access  Private
exports.updatePrivacy = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.privacy = { ...profile.privacy, ...req.body };
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: profile.privacy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    View profile (track views)
// @route   GET /api/profile/view/:profileId
// @access  Private
exports.viewProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ profileId: req.params.profileId })
      .populate('userId', 'email');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Don't count own profile views
    if (profile.userId._id.toString() !== req.user.id) {
      // Increment view count
      profile.stats.views += 1;
      await profile.save();

      // Create view interaction
      await Interaction.findOneAndUpdate(
        {
          fromUserId: req.user.id,
          toUserId: profile.userId._id,
          interactionType: 'view'
        },
        {
          fromUserId: req.user.id,
          toUserId: profile.userId._id,
          interactionType: 'view',
          status: 'active'
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/profile/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const Profile = require('../models/Profile');
    const Interaction = require('../models/Interaction');
    const Match = require('../models/Match');

    // Get user's profile
    const profile = await Profile.findOne({ userId: req.user.id });
    
    // If no profile exists, return zeros
    if (!profile) {
      return res.status(200).json({
        success: true,
        data: {
          profileViews: 0,
          interests: 0,
          shortlists: 0,
          matches: 0
        }
      });
    }

    // Get profile views from stats
    const profileViews = profile.stats?.views || 0;

    // Count interests received (people who sent interest to this user)
    const interestsReceived = await Interaction.countDocuments({
      toUserId: req.user.id,
      interactionType: 'interest',
      status: { $in: ['pending', 'accepted'] }
    });

    // Count shortlisted by this user (people this user has shortlisted)
    const shortlisted = await Interaction.countDocuments({
      fromUserId: req.user.id,
      interactionType: 'shortlist',
      status: 'active'
    });

    // Count matches (mutual interests or suggested matches)
    const matches = await Match.countDocuments({
      userId: req.user.id,
      status: { $in: ['suggested', 'viewed', 'interested'] }
    });

    res.status(200).json({
      success: true,
      data: {
        profileViews,
        interests: interestsReceived,
        shortlists: shortlisted,
        matches
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
