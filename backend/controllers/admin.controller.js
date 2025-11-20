const User = require('../models/User');
const Profile = require('../models/Profile');
const Report = require('../models/Report');
const Match = require('../models/Match');
const Interaction = require('../models/Interaction');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    
    const totalProfiles = await Profile.countDocuments();
    const verifiedProfiles = await Profile.countDocuments({ isProfileVerified: true });
    const maleProfiles = await Profile.countDocuments({ gender: 'male' });
    const femaleProfiles = await Profile.countDocuments({ gender: 'female' });
    
    const totalInterests = await Interaction.countDocuments({ type: 'interest' });
    const acceptedInterests = await Interaction.countDocuments({ 
      type: 'interest', 
      status: 'accepted' 
    });
    
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const pendingVerifications = await Profile.countDocuments({ 
      verificationStatus: 'pending' 
    });

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          active: activeUsers,
          blocked: blockedUsers,
          recent: recentUsers
        },
        profiles: {
          total: totalProfiles,
          verified: verifiedProfiles,
          male: maleProfiles,
          female: femaleProfiles
        },
        interactions: {
          totalInterests,
          acceptedInterests,
          successRate: totalInterests > 0 
            ? ((acceptedInterests / totalInterests) * 100).toFixed(2) 
            : 0
        },
        pending: {
          reports: pendingReports,
          verifications: pendingVerifications
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    const query = {};
    if (search) {
      query.email = new RegExp(search, 'i');
    }
    if (status === 'active') query.isActive = true;
    if (status === 'blocked') query.isBlocked = true;
    if (status === 'verified') query.isVerified = true;

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
    next(error);
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:userId
// @access  Private/Admin
exports.getUserDetails = async (req, res, next) => {
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
      $or: [{ fromUser: user._id }, { toUser: user._id }]
    }).countDocuments();

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
        stats: {
          totalInteractions: interactions
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:userId/block
// @access  Private/Admin
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked ? 'User blocked' : 'User unblocked',
      data: { isBlocked: user.isBlocked }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete profile
    await Profile.findOneAndDelete({ userId: user._id });
    
    // Delete interactions
    await Interaction.deleteMany({
      $or: [{ fromUser: user._id }, { toUser: user._id }]
    });

    // Delete matches
    await Match.deleteMany({
      $or: [{ userId: user._id }, { matchedUser: user._id }]
    });

    // Delete user
    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reportedBy', 'email')
      .populate('reportedUser', 'email')
      .populate('reviewedBy', 'email')
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
    next(error);
  }
};

// @desc    Review report
// @route   PUT /api/admin/reports/:reportId
// @access  Private/Admin
exports.reviewReport = async (req, res, next) => {
  try {
    const { status, actionTaken, reviewNotes } = req.body;

    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    report.actionTaken = actionTaken;
    report.reviewNotes = reviewNotes;
    report.reviewedBy = req.user.id;
    report.reviewedAt = Date.now();
    await report.save();

    // Take action based on decision
    if (actionTaken === 'account_blocked') {
      await User.findByIdAndUpdate(report.reportedUser, { isBlocked: true });
    } else if (actionTaken === 'profile_hidden') {
      await Profile.findOneAndUpdate(
        { userId: report.reportedUser },
        { profileVisibility: 'members_only' }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Report reviewed successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    // User growth (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } }
      },
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
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Popular cities
    const popularCities = await Profile.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Interest success rate
    const interestStats = await Interaction.aggregate([
      {
        $match: { type: 'interest' }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userGrowth,
        genderDistribution,
        popularCities,
        interestStats
      }
    });
  } catch (error) {
    next(error);
  }
};