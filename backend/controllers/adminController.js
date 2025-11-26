const User = require('../models/User');
const Profile = require('../models/Profile');
const Match = require('../models/Match');
const Interaction = require('../models/Interaction');
const Report = require('../models/Report');
const moment = require('moment');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const totalProfiles = await Profile.countDocuments();
    const premiumProfiles = await Profile.countDocuments({ isPremium: true });
    const totalMatches = await Match.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    
    // Recent registrations (last 7 days)
    const last7Days = moment().subtract(7, 'days').toDate();
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: last7Days }
    });

    // Recent interactions
    const recentInterests = await Interaction.countDocuments({
      interactionType: 'interest',
      createdAt: { $gte: last7Days }
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers,
          recentRegistrations
        },
        profiles: {
          total: totalProfiles,
          premium: premiumProfiles
        },
        matches: {
          total: totalMatches
        },
        interactions: {
          recentInterests
        },
        reports: {
          pending: pendingReports
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, verified } = req.query;

    let query = {};
    
    if (status) {
      query.isActive = status === 'active';
    }
    
    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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

// @desc    Get user details
// @route   GET /api/admin/users/:userId
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = await Profile.findOne({ userId: user._id });
    const interactions = await Interaction.find({
      $or: [
        { fromUserId: user._id },
        { toUserId: user._id }
      ]
    }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
        recentInteractions: interactions
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

// @desc    Update user status
// @route   PUT /api/admin/users/:userId/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive, isVerified } = req.body;

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    
    if (isVerified !== undefined) {
      user.isVerified = isVerified;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User status updated',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Suspend user
// @route   PUT /api/admin/users/:userId/suspend
// @access  Private/Admin
exports.suspendUser = async (req, res) => {
  try {
    const { reason, duration } = req.body; // duration in days

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    user.suspendedAt = new Date();
    user.suspensionReason = reason;
    
    if (duration) {
      user.suspendedUntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete associated profile
    await Profile.findOneAndDelete({ userId: user._id });

    // Delete user's interactions
    await Interaction.deleteMany({
      $or: [{ fromUserId: user._id }, { toUserId: user._id }]
    });

    // Delete user's matches
    await Match.deleteMany({
      $or: [{ user1: user._id }, { user2: user._id }]
    });

    // Delete the user
    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all profiles
// @route   GET /api/admin/profiles
// @access  Private/Admin
exports.getAllProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 20, verified, premium } = req.query;

    let query = {};
    
    if (verified !== undefined) {
      query['verification.idVerified'] = verified === 'true';
    }
    
    if (premium !== undefined) {
      query.isPremium = premium === 'true';
    }

    const profiles = await Profile.find(query)
      .populate('userId', 'email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Profile.countDocuments(query);

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
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify profile
// @route   PUT /api/admin/profiles/:profileId/verify
// @access  Private/Admin
exports.verifyProfile = async (req, res) => {
  try {
    const { idVerified, photoVerified, educationVerified, incomeVerified } = req.body;

    const profile = await Profile.findOne({ profileId: req.params.profileId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (idVerified !== undefined) profile.verification.idVerified = idVerified;
    if (photoVerified !== undefined) profile.verification.photoVerified = photoVerified;
    if (educationVerified !== undefined) profile.verification.educationVerified = educationVerified;
    if (incomeVerified !== undefined) profile.verification.incomeVerified = incomeVerified;

    if (idVerified || photoVerified || educationVerified || incomeVerified) {
      profile.verification.verifiedAt = new Date();
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile verification updated',
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

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = {};
    
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('reportedBy', 'email')
      .populate('reportedUser', 'email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
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

// @desc    Update report
// @route   PUT /api/admin/reports/:reportId
// @access  Private/Admin
exports.updateReport = async (req, res) => {
  try {
    const { status, actionTaken, adminNotes } = req.body;

    const report = await Report.findById(req.params.reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (status) report.status = status;
    if (actionTaken) report.actionTaken = actionTaken;
    if (adminNotes) report.adminNotes = adminNotes;
    
    report.reviewedBy = req.user.id;
    report.reviewedAt = new Date();

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = Object.keys(dateFilter).length > 0 
      ? { createdAt: dateFilter } 
      : {};

    // User registrations over time
    const userRegistrations = await User.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Interests over time
    const interests = await Interaction.aggregate([
      { $match: { interactionType: 'interest', ...query } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Gender distribution
    const genderDistribution = await Profile.aggregate([
      {
        $group: {
          _id: '$personalInfo.gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Religion distribution
    const religionDistribution = await Profile.aggregate([
      {
        $group: {
          _id: '$religiousInfo.religion',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userRegistrations,
        interests,
        genderDistribution,
        religionDistribution
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
