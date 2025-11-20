const Preference = require('../models/Preference');

// @desc    Create/Update preferences
// @route   POST /api/preferences
// @access  Private
exports.setPreferences = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;

    let preference = await Preference.findOne({ userId: req.user.id });

    if (preference) {
      // Update existing preferences
      preference = await Preference.findOneAndUpdate(
        { userId: req.user.id },
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      // Create new preferences
      preference = await Preference.create(req.body);
    }

    res.status(200).json({
      success: true,
      message: 'Preferences saved successfully',
      data: preference
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user preferences
// @route   GET /api/preferences
// @access  Private
exports.getPreferences = async (req, res, next) => {
  try {
    const preference = await Preference.findOne({ userId: req.user.id });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: 'Preferences not set'
      });
    }

    res.status(200).json({
      success: true,
      data: preference
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete preferences
// @route   DELETE /api/preferences
// @access  Private
exports.deletePreferences = async (req, res, next) => {
  try {
    const preference = await Preference.findOneAndDelete({ userId: req.user.id });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: 'Preferences not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Preferences deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};