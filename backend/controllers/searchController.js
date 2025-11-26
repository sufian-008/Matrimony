const Profile = require('../models/Profile');
const Preference = require('../models/Preference');
const { calculateAge } = require('../utils/helpers');

// @desc    Basic search
// @route   GET /api/search/basic
// @access  Private
exports.basicSearch = async (req, res) => {
  try {
    const { age, gender, location, page = 1, limit = 20 } = req.query;
    
    const myProfile = await Profile.findOne({ userId: req.user.id });

    let query = {
      userId: { $ne: req.user.id },
      isActive: true,
      'privacy.profileVisibility': 'public'
    };

    // Gender filter
    if (gender) {
      query['personalInfo.gender'] = gender;
    } else if (myProfile) {
      // If user has profile, show opposite gender
      query['personalInfo.gender'] = myProfile.personalInfo.gender === 'male' ? 'female' : 'male';
    }

    // Location filter
    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }

    const profiles = await Profile.find(query)
      .select('-documents -privacy')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Filter by age if provided
    let filteredProfiles = profiles;
    if (age) {
      filteredProfiles = profiles.filter(profile => {
        const profileAge = calculateAge(profile.personalInfo.dateOfBirth);
        return profileAge === parseInt(age);
      });
    }

    const count = await Profile.countDocuments(query);

    res.status(200).json({
      success: true,
      data: filteredProfiles,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Basic search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Advanced search
// @route   POST /api/search/advanced
// @access  Private
exports.advancedSearch = async (req, res) => {
  try {
    const {
      ageMin,
      ageMax,
      heightMin,
      heightMax,
      maritalStatus,
      religion,
      caste,
      education,
      occupation,
      country,
      state,
      city,
      page = 1,
      limit = 20
    } = req.body;

    const myProfile = await Profile.findOne({ userId: req.user.id });
    if (!myProfile) {
      return res.status(404).json({
        success: false,
        message: 'Please create your profile first'
      });
    }

    let query = {
      userId: { $ne: req.user.id },
      isActive: true,
      'privacy.profileVisibility': 'public',
      'personalInfo.gender': myProfile.personalInfo.gender === 'male' ? 'female' : 'male'
    };

    // Height filter
    if (heightMin || heightMax) {
      query['personalInfo.height'] = {};
      if (heightMin) query['personalInfo.height'].$gte = heightMin;
      if (heightMax) query['personalInfo.height'].$lte = heightMax;
    }

    // Marital status filter
    if (maritalStatus && maritalStatus.length > 0) {
      query['personalInfo.maritalStatus'] = { $in: maritalStatus };
    }

    // Religion filter
    if (religion && religion.length > 0) {
      query['religiousInfo.religion'] = { $in: religion };
    }

    // Caste filter
    if (caste && caste.length > 0) {
      query['religiousInfo.caste'] = { $in: caste };
    }

    // Education filter
    if (education && education.length > 0) {
      query['professionalInfo.education'] = { $in: education };
    }

    // Occupation filter
    if (occupation && occupation.length > 0) {
      query['professionalInfo.occupation'] = { $in: occupation };
    }

    // Location filters
    if (country) query['location.country'] = country;
    if (state) query['location.state'] = state;
    if (city) query['location.city'] = new RegExp(city, 'i');

    const profiles = await Profile.find(query)
      .select('-documents -privacy')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Filter by age range
    let filteredProfiles = profiles;
    if (ageMin || ageMax) {
      filteredProfiles = profiles.filter(profile => {
        const profileAge = calculateAge(profile.personalInfo.dateOfBirth);
        let matchesAge = true;
        if (ageMin) matchesAge = matchesAge && profileAge >= ageMin;
        if (ageMax) matchesAge = matchesAge && profileAge <= ageMax;
        return matchesAge;
      });
    }

    const count = await Profile.countDocuments(query);

    res.status(200).json({
      success: true,
      data: filteredProfiles,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search by profile ID
// @route   GET /api/search/by-id/:profileId
// @access  Private
exports.searchById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ 
      profileId: req.params.profileId,
      isActive: true 
    }).select('-documents');

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

// @desc    Get recommendations based on preferences
// @route   GET /api/search/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const myProfile = await Profile.findOne({ userId: req.user.id });
    if (!myProfile) {
      return res.status(404).json({
        success: false,
        message: 'Please create your profile first'
      });
    }

    const preference = await Preference.findOne({ userId: req.user.id });
    if (!preference) {
      return res.status(404).json({
        success: false,
        message: 'Please set your preferences first'
      });
    }

    let query = {
      userId: { $ne: req.user.id },
      isActive: true,
      'privacy.profileVisibility': 'public',
      'personalInfo.gender': myProfile.personalInfo.gender === 'male' ? 'female' : 'male'
    };

    // Apply preference filters
    if (preference.maritalStatus && preference.maritalStatus.length > 0) {
      query['personalInfo.maritalStatus'] = { $in: preference.maritalStatus };
    }

    if (preference.religion && preference.religion.length > 0) {
      query['religiousInfo.religion'] = { $in: preference.religion };
    }

    if (preference.location.countries && preference.location.countries.length > 0) {
      query['location.country'] = { $in: preference.location.countries };
    }

    if (preference.education && preference.education.length > 0) {
      query['professionalInfo.education'] = { $in: preference.education };
    }

    const profiles = await Profile.find(query)
      .select('-documents -privacy')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ isPremium: -1, createdAt: -1 });

    // Filter by age and height
    let recommendedProfiles = profiles.filter(profile => {
      const profileAge = calculateAge(profile.personalInfo.dateOfBirth);
      let matches = true;

      if (preference.ageRange) {
        matches = matches && profileAge >= preference.ageRange.min && profileAge <= preference.ageRange.max;
      }

      if (preference.heightRange && preference.heightRange.min && preference.heightRange.max) {
        matches = matches && 
          profile.personalInfo.height >= preference.heightRange.min && 
          profile.personalInfo.height <= preference.heightRange.max;
      }

      return matches;
    });

    const count = await Profile.countDocuments(query);

    res.status(200).json({
      success: true,
      data: recommendedProfiles,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
