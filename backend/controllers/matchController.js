const Match = require('../models/Match');
const Profile = require('../models/Profile');
const Preference = require('../models/Preference');
const { calculateMatchScore } = require('../utils/helpers');

// @desc    Get match suggestions
// @route   GET /api/match/suggestions
// @access  Private
exports.getMatchSuggestions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const myProfile = await Profile.findOne({ userId: req.user.id });
    if (!myProfile) {
      // If no profile, return all active profiles
      const profiles = await Profile.find({
        userId: { $ne: req.user.id },
        isActive: true,
        'privacy.profileVisibility': 'public'
      })
      .select('-documents -privacy')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

      const count = await Profile.countDocuments({
        userId: { $ne: req.user.id },
        isActive: true,
        'privacy.profileVisibility': 'public'
      });

      return res.status(200).json({
        success: true,
        data: profiles.map(p => ({ profile: p, score: 0 })),
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      });
    }

    const myPreference = await Preference.findOne({ userId: req.user.id });
    
    // Get all potential matches
    const profiles = await Profile.find({
      userId: { $ne: req.user.id },
      isActive: true,
      'privacy.profileVisibility': 'public',
      'personalInfo.gender': myProfile.personalInfo.gender === 'male' ? 'female' : 'male'
    }).populate('userId', 'email');

    // Calculate match scores
    const matchesWithScores = [];
    
    for (const profile of profiles) {
      if (myPreference) {
        const score = calculateMatchScore(profile, myPreference);
        
        if (score >= 50) { // Only suggest matches with 50% or higher compatibility
          matchesWithScores.push({
            profile,
            score
          });
        }
      } else {
        matchesWithScores.push({
          profile,
          score: 0
        });
      }
    }

    // Sort by score
    matchesWithScores.sort((a, b) => b.score - a.score);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedMatches = matchesWithScores.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedMatches,
      pagination: {
        total: matchesWithScores.length,
        page: parseInt(page),
        pages: Math.ceil(matchesWithScores.length / limit)
      }
    });
  } catch (error) {
    console.error('Match suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Calculate match with specific profile
// @route   POST /api/match/calculate/:profileId
// @access  Private
exports.calculateMatch = async (req, res) => {
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

    const myPreference = await Preference.findOne({ userId: req.user.id });
    
    if (!myPreference) {
      return res.status(404).json({
        success: false,
        message: 'Please set your preferences first'
      });
    }

    const matchScore = calculateMatchScore(targetProfile, myPreference);

    // Save or update match
    const match = await Match.findOneAndUpdate(
      {
        userId: req.user.id,
        matchedUserId: targetProfile.userId._id
      },
      {
        userId: req.user.id,
        matchedUserId: targetProfile.userId._id,
        matchScore,
        status: 'suggested'
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        profile: targetProfile,
        matchScore,
        match
      }
    });
  } catch (error) {
    console.error('Calculate match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my matches
// @route   GET /api/match/my-matches
// @access  Private
exports.getMyMatches = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = { userId: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate({
        path: 'matchedUserId',
        select: 'email'
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ matchScore: -1, createdAt: -1 });

    // Get profiles for matched users
    const matchesWithProfiles = await Promise.all(
      matches.map(async (match) => {
        const profile = await Profile.findOne({ 
          userId: match.matchedUserId 
        }).select('-documents -privacy');
        
        return {
          match,
          profile
        };
      })
    );

    const count = await Match.countDocuments(query);

    res.status(200).json({
      success: true,
      data: matchesWithProfiles,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
