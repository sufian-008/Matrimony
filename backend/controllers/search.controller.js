const Profile = require('../models/Profile');
const Preference = require('../models/Preference');

// @desc    Basic search
// @route   GET /api/search
// @access  Private
exports.searchProfiles = async (req, res, next) => {
  try {
    const {
      gender,
      ageFrom,
      ageTo,
      religion,
      caste,
      maritalStatus,
      city,
      state,
      country,
      education,
      occupation,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};

    // Exclude own profile
    const myProfile = await Profile.findOne({ userId: req.user.id });
    if (myProfile) {
      query.userId = { $ne: req.user.id };
    }

    if (gender) query.gender = gender;
    if (ageFrom || ageTo) {
      query.age = {};
      if (ageFrom) query.age.$gte = parseInt(ageFrom);
      if (ageTo) query.age.$lte = parseInt(ageTo);
    }
    if (religion) query.religion = new RegExp(religion, 'i');
    if (caste) query.caste = new RegExp(caste, 'i');
    if (maritalStatus) query.maritalStatus = maritalStatus;
    if (city) query.city = new RegExp(city, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (country) query.country = new RegExp(country, 'i');
    if (education) query.education = new RegExp(education, 'i');
    if (occupation) query.occupation = new RegExp(occupation, 'i');

    // Execute query with pagination
    const profiles = await Profile.find(query)
      .populate('userId', 'email isVerified')
      .select('-documents')
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
    next(error);
  }
};

// @desc    Search by ID
// @route   GET /api/search/id/:profileId
// @access  Private
exports.searchById = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.profileId)
      .populate('userId', 'email isVerified');

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

// @desc    Advanced search
// @route   POST /api/search/advanced
// @access  Private
exports.advancedSearch = async (req, res, next) => {
  try {
    const {
      gender,
      ageRange,
      heightRange,
      maritalStatus,
      religion,
      caste,
      motherTongue,
      location,
      education,
      occupation,
      annualIncome,
      diet,
      smoking,
      drinking,
      page = 1,
      limit = 20
    } = req.body;

    const query = {};

    // Exclude own profile
    query.userId = { $ne: req.user.id };

    if (gender) query.gender = gender;
    
    if (ageRange) {
      query.age = {
        $gte: ageRange.min || 18,
        $lte: ageRange.max || 100
      };
    }

    if (heightRange) {
      query.height = {
        $gte: heightRange.min || 0,
        $lte: heightRange.max || 300
      };
    }

    if (maritalStatus && maritalStatus.length > 0) {
      query.maritalStatus = { $in: maritalStatus };
    }

    if (religion) query.religion = new RegExp(religion, 'i');
    if (caste) query.caste = new RegExp(caste, 'i');
    if (motherTongue) query.motherTongue = new RegExp(motherTongue, 'i');

    if (location) {
      if (location.city) query.city = new RegExp(location.city, 'i');
      if (location.state) query.state = new RegExp(location.state, 'i');
      if (location.country) query.country = new RegExp(location.country, 'i');
    }

    if (education) query.education = new RegExp(education, 'i');
    if (occupation) query.occupation = new RegExp(occupation, 'i');
    if (annualIncome) query.annualIncome = new RegExp(annualIncome, 'i');
    if (diet) query.diet = diet;
    if (smoking) query.smoking = smoking;
    if (drinking) query.drinking = drinking;

    const profiles = await Profile.find(query)
      .populate('userId', 'email isVerified')
      .select('-documents')
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
    next(error);
  }
};

// @desc    Get recently joined profiles
// @route   GET /api/search/recent
// @access  Private
exports.getRecentProfiles = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const profiles = await Profile.find({ userId: { $ne: req.user.id } })
      .populate('userId', 'email isVerified')
      .select('-documents')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: profiles
    });
  } catch (error) {
    next(error);
  }
};