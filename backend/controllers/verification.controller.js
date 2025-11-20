const Profile = require('../models/Profile');
const { deleteFile } = require('../utils/fileUpload');

// @desc    Submit profile for verification
// @route   POST /api/verification/submit
// @access  Private
exports.submitForVerification = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (profile.verificationStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Verification already pending'
      });
    }

    // Check if required documents uploaded
    if (profile.documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one verification document'
      });
    }

    profile.verificationStatus = 'pending';
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile submitted for verification'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending verifications (Admin)
// @route   GET /api/verification/pending
// @access  Private/Admin
exports.getPendingVerifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const profiles = await Profile.find({
      verificationStatus: 'pending'
    })
      .populate('userId', 'email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });

    const count = await Profile.countDocuments({ verificationStatus: 'pending' });

    res.status(200).json({
      success: true,
      data: profiles,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify profile (Admin)
// @route   PUT /api/verification/:profileId/approve
// @access  Private/Admin
exports.approveVerification = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.verificationStatus = 'verified';
    profile.isProfileVerified = true;
    
    // Mark all photos as verified
    profile.photos.forEach(photo => {
      photo.isVerified = true;
    });
    
    // Mark all documents as verified
    profile.documents.forEach(doc => {
      doc.isVerified = true;
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile verified successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject profile verification (Admin)
// @route   PUT /api/verification/:profileId/reject
// @access  Private/Admin
exports.rejectVerification = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const profile = await Profile.findById(req.params.profileId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.verificationStatus = 'rejected';
    profile.isProfileVerified = false;
    await profile.save();

    // TODO: Send email notification with reason

    res.status(200).json({
      success: true,
      message: 'Profile verification rejected',
      data: { reason }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get verification status
// @route   GET /api/verification/status
// @access  Private
exports.getVerificationStatus = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id })
      .select('verificationStatus isProfileVerified');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        verificationStatus: profile.verificationStatus,
        isProfileVerified: profile.isProfileVerified
      }
    });
  } catch (error) {
    next(error);
  }
};