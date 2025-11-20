const Profile = require('../models/Profile');
const User = require('../models/User');
const { deleteFile } = require('../utils/fileUpload');

// @desc    Create profile
// @route   POST /api/profile
// @access  Private
exports.createProfile = async (req, res, next) => {
  try {
    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists. Use update endpoint instead.'
      });
    }

    // Add userId to request body
    req.body.userId = req.user.id;

    // Handle profile photo upload
    if (req.file) {
      req.body.profilePhoto = req.file.path;
    }

    // Create profile
    const profile = await Profile.create(req.body);

    // Update user profileCompleted status
    await User.findByIdAndUpdate(req.user.id, { profileCompleted: true });

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    // Delete uploaded file if profile creation fails
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(error);
  }
};

// @desc    Get own profile
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
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
    next(error);
  }
};

// @desc    Get profile by ID
// @route   GET /api/profile/:id
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.id })
      .populate('userId', 'email isVerified');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Increment profile views
    profile.profileViews += 1;
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Create profile first.'
      });
    }

    // Handle profile photo upload
    if (req.file) {
      // Delete old photo
      if (profile.profilePhoto) {
        deleteFile(profile.profilePhoto);
      }
      req.body.profilePhoto = req.file.path;
    }

    // Update profile
    profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(error);
  }
};

// @desc    Upload additional photos
// @route   POST /api/profile/photos
// @access  Private
exports.uploadPhotos = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check max photos limit (e.g., 5 photos)
    if (profile.photos.length >= 5) {
      if (req.files) {
        req.files.forEach(file => deleteFile(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 photos allowed'
      });
    }

    // Add new photos
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => ({
        url: file.path,
        isVerified: false,
        uploadedAt: Date.now()
      }));

      profile.photos.push(...newPhotos.slice(0, 5 - profile.photos.length));
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Photos uploaded successfully',
      data: profile.photos
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    next(error);
  }
};

// @desc    Delete photo
// @route   DELETE /api/profile/photos/:photoId
// @access  Private
exports.deletePhoto = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const photoIndex = profile.photos.findIndex(
      photo => photo._id.toString() === req.params.photoId
    );

    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Delete file
    deleteFile(profile.photos[photoIndex].url);

    // Remove from array
    profile.photos.splice(photoIndex, 1);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload documents
// @route   POST /api/profile/documents
// @access  Private
exports.uploadDocuments = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Add documents
    const newDocuments = req.files.map((file, index) => ({
      type: req.body.types ? req.body.types[index] : 'other',
      url: file.path,
      isVerified: false,
      uploadedAt: Date.now()
    }));

    profile.documents.push(...newDocuments);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: profile.documents
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/profile/documents/:docId
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const docIndex = profile.documents.findIndex(
      doc => doc._id.toString() === req.params.docId
    );

    if (docIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file
    deleteFile(profile.documents[docIndex].url);

    // Remove from array
    profile.documents.splice(docIndex, 1);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update privacy settings
// @route   PUT /api/profile/privacy
// @access  Private
exports.updatePrivacy = async (req, res, next) => {
  try {
    const { profileVisibility, showContactDetails } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { profileVisibility, showContactDetails },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated',
      data: {
        profileVisibility: profile.profileVisibility,
        showContactDetails: profile.showContactDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile
// @route   DELETE /api/profile
// @access  Private
exports.deleteProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Delete profile photo
    if (profile.profilePhoto) {
      deleteFile(profile.profilePhoto);
    }

    // Delete additional photos
    profile.photos.forEach(photo => deleteFile(photo.url));

    // Delete documents
    profile.documents.forEach(doc => deleteFile(doc.url));

    // Delete profile
    await Profile.findOneAndDelete({ userId: req.user.id });

    // Update user status
    await User.findByIdAndUpdate(req.user.id, { profileCompleted: false });

    res.status(200).json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};