const Interaction = require('../models/Interaction');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { sendInterestNotification } = require('../utils/email');

// @desc    Send interest
// @route   POST /api/interaction/interest/:profileId
// @access  Private
exports.sendInterest = async (req, res) => {
  try {
    // Check if user has a profile
    const myProfile = await Profile.findOne({ userId: req.user.id });
    if (!myProfile) {
      return res.status(400).json({
        success: false,
        message: 'Please create your profile first to send interests'
      });
    }

    const targetProfile = await Profile.findOne({ 
      profileId: req.params.profileId 
    }).populate('userId', 'email');

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (!targetProfile.userId) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    if (targetProfile.userId._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send interest to yourself'
      });
    }

    // Check if interest already sent
    const existingInterest = await Interaction.findOne({
      fromUserId: req.user.id,
      toUserId: targetProfile.userId._id,
      interactionType: 'interest'
    });

    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: 'Interest already sent'
      });
    }

    const interaction = await Interaction.create({
      fromUserId: req.user.id,
      toUserId: targetProfile.userId._id,
      interactionType: 'interest',
      message: req.body.message,
      status: 'pending'
    });

    // Get sender name for notification
    const senderName = `${myProfile.personalInfo.firstName} ${myProfile.personalInfo.lastName}`;

    // Send email notification
    try {
      await sendInterestNotification(targetProfile.userId.email, senderName);
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Interest sent successfully',
      data: interaction
    });
  } catch (error) {
    console.error('Send interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Respond to interest
// @route   PUT /api/interaction/interest/:interactionId
// @access  Private
exports.respondToInterest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    const interaction = await Interaction.findById(req.params.interactionId);

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }

    if (interaction.toUserId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    interaction.status = status;
    await interaction.save();

    res.status(200).json({
      success: true,
      message: `Interest ${status}`,
      data: interaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add to shortlist
// @route   POST /api/interaction/shortlist/:profileId
// @access  Private
exports.addToShortlist = async (req, res) => {
  try {
    // Check if user has a profile
    const myProfile = await Profile.findOne({ userId: req.user.id });
    if (!myProfile) {
      return res.status(400).json({
        success: false,
        message: 'Please create your profile first'
      });
    }

    const targetProfile = await Profile.findOne({ 
      profileId: req.params.profileId 
    }).populate('userId', 'email');

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (!targetProfile.userId) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    const interaction = await Interaction.findOneAndUpdate(
      {
        fromUserId: req.user.id,
        toUserId: targetProfile.userId._id,
        interactionType: 'shortlist'
      },
      {
        fromUserId: req.user.id,
        toUserId: targetProfile.userId._id,
        interactionType: 'shortlist',
        status: 'active'
      },
      { upsert: true, new: true }
    );

    // Update profile stats
    targetProfile.stats = targetProfile.stats || {};
    targetProfile.stats.shortlists = (targetProfile.stats.shortlists || 0) + 1;
    await targetProfile.save();

    res.status(201).json({
      success: true,
      message: 'Added to shortlist',
      data: interaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove from shortlist
// @route   DELETE /api/interaction/shortlist/:profileId
// @access  Private
exports.removeFromShortlist = async (req, res) => {
  try {
    const targetProfile = await Profile.findOne({ 
      profileId: req.params.profileId 
    }).populate('userId', 'email');

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (!targetProfile.userId) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    await Interaction.findOneAndUpdate(
      {
        fromUserId: req.user.id,
        toUserId: targetProfile.userId._id,
        interactionType: 'shortlist'
      },
      { status: 'removed' }
    );

    res.status(200).json({
      success: true,
      message: 'Removed from shortlist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my shortlists
// @route   GET /api/interaction/shortlists
// @access  Private
exports.getMyShortlists = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const interactions = await Interaction.find({
      fromUserId: req.user.id,
      interactionType: 'shortlist',
      status: 'active'
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const shortlistedProfiles = await Promise.all(
      interactions.map(async (interaction) => {
        const profile = await Profile.findOne({ 
          userId: interaction.toUserId 
        }).select('-documents -privacy');
        return profile;
      })
    );

    const count = await Interaction.countDocuments({
      fromUserId: req.user.id,
      interactionType: 'shortlist',
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: shortlistedProfiles,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add to favorites
// @route   POST /api/interaction/favorite/:profileId
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    // Check if user has a profile
    const myProfile = await Profile.findOne({ userId: req.user.id });
    if (!myProfile) {
      return res.status(400).json({
        success: false,
        message: 'Please create your profile first'
      });
    }

    const targetProfile = await Profile.findOne({ 
      profileId: req.params.profileId 
    }).populate('userId', 'email');

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (!targetProfile.userId) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    const interaction = await Interaction.findOneAndUpdate(
      {
        fromUserId: req.user.id,
        toUserId: targetProfile.userId._id,
        interactionType: 'favorite'
      },
      {
        fromUserId: req.user.id,
        toUserId: targetProfile.userId._id,
        interactionType: 'favorite',
        status: 'active'
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: interaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/interaction/favorite/:profileId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    const targetProfile = await Profile.findOne({ 
      profileId: req.params.profileId 
    }).populate('userId', 'email');

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (!targetProfile.userId) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    await Interaction.findOneAndUpdate(
      {
        fromUserId: req.user.id,
        toUserId: targetProfile.userId._id,
        interactionType: 'favorite'
      },
      { status: 'removed' }
    );

    res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my favorites
// @route   GET /api/interaction/favorites
// @access  Private
exports.getMyFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const interactions = await Interaction.find({
      fromUserId: req.user.id,
      interactionType: 'favorite',
      status: 'active'
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const favoriteProfiles = await Promise.all(
      interactions.map(async (interaction) => {
        const profile = await Profile.findOne({ 
          userId: interaction.toUserId 
        }).select('-documents -privacy');
        return profile;
      })
    );

    const count = await Interaction.countDocuments({
      fromUserId: req.user.id,
      interactionType: 'favorite',
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: favoriteProfiles,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get sent interests
// @route   GET /api/interaction/interests/sent
// @access  Private
exports.getSentInterests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const interactions = await Interaction.find({
      fromUserId: req.user.id,
      interactionType: 'interest'
    })
    .populate('toUserId', 'email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const interestsWithProfiles = await Promise.all(
      interactions.map(async (interaction) => {
        const profile = await Profile.findOne({ 
          userId: interaction.toUserId 
        }).select('-documents -privacy');
        return {
          interaction,
          profile
        };
      })
    );

    const count = await Interaction.countDocuments({
      fromUserId: req.user.id,
      interactionType: 'interest'
    });

    res.status(200).json({
      success: true,
      data: interestsWithProfiles,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get received interests
// @route   GET /api/interaction/interests/received
// @access  Private
exports.getReceivedInterests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const interactions = await Interaction.find({
      toUserId: req.user.id,
      interactionType: 'interest'
    })
    .populate('fromUserId', 'email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const interestsWithProfiles = await Promise.all(
      interactions.map(async (interaction) => {
        const profile = await Profile.findOne({ 
          userId: interaction.fromUserId 
        }).select('-documents -privacy');
        return {
          interaction,
          profile
        };
      })
    );

    const count = await Interaction.countDocuments({
      toUserId: req.user.id,
      interactionType: 'interest'
    });

    res.status(200).json({
      success: true,
      data: interestsWithProfiles,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Block user
// @route   POST /api/interaction/block/:profileId
// @access  Private
exports.blockUser = async (req, res) => {
  try {
    const targetProfile = await Profile.findOne({ 
      profileId: req.params.profileId 
    }).populate('userId', 'email');

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (!targetProfile.userId) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    const interaction = await Interaction.findOneAndUpdate(
      {
        fromUserId: req.user.id,
        toUserId: targetProfile.userId._id,
        interactionType: 'block'
      },
      {
        fromUserId: req.user.id,
        toUserId: targetProfile.userId._id,
        interactionType: 'block',
        status: 'active'
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'User blocked successfully',
      data: interaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
