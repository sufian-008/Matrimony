const Report = require('../models/Report');

// @desc    Report a user
// @route   POST /api/reports/:userId
// @access  Private
exports.reportUser = async (req, res, next) => {
  try {
    const { reason, description } = req.body;
    const reportedUser = req.params.userId;

    if (reportedUser === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot report yourself'
      });
    }

    // Check if already reported
    const existingReport = await Report.findOne({
      reportedBy: req.user.id,
      reportedUser,
      status: { $in: ['pending', 'reviewing'] }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this user'
      });
    }

    const report = await Report.create({
      reportedBy: req.user.id,
      reportedUser,
      reason,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it.',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my reports
// @route   GET /api/reports/my-reports
// @access  Private
exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reportedBy: req.user.id })
      .populate('reportedUser', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};