const Match = require('../models/Match');
const Profile = require('../models/Profile');
const Preference = require('../models/Preference');

// Matching algorithm
const calculateMatchScore = (userProfile, candidateProfile, userPreferences) => {
  let totalScore = 0;
  let totalWeight = 0;
  const details = {};

  if (!userPreferences) {
    // Basic matching without preferences
    return { score: 50, details: {} };
  }

  // Age matching
  if (userPreferences.ageFrom && userPreferences.ageTo) {
    const ageScore = (candidateProfile.age >= userPreferences.ageFrom && 
                      candidateProfile.age <= userPreferences.ageTo) ? 100 : 0;
    details.ageScore = ageScore;
    totalScore += ageScore * (userPreferences.weights?.age || 10);
    totalWeight += (userPreferences.weights?.age || 10);
  }

  // Height matching
  if (userPreferences.heightFrom && userPreferences.heightTo) {
    const heightScore = (candidateProfile.height >= userPreferences.heightFrom && 
                         candidateProfile.height <= userPreferences.heightTo) ? 100 : 0;
    details.heightScore = heightScore;
    totalScore += heightScore * (userPreferences.weights?.height || 5);
    totalWeight += (userPreferences.weights?.height || 5);
  }

  // Location matching
  if (userPreferences.cities && userPreferences.cities.length > 0) {
    const locationScore = userPreferences.cities.some(city => 
      city.toLowerCase() === candidateProfile.city.toLowerCase()) ? 100 : 50;
    details.locationScore = locationScore;
    totalScore += locationScore * (userPreferences.weights?.location || 8);
    totalWeight += (userPreferences.weights?.location || 8);
  }

  // Religion matching
  if (userPreferences.religions && userPreferences.religions.length > 0) {
    const religionScore = userPreferences.religions.some(religion => 
      religion.toLowerCase() === candidateProfile.religion.toLowerCase()) ? 100 : 0;
    details.religionScore = religionScore;
    totalScore += religionScore * (userPreferences.weights?.religion || 9);
    totalWeight += (userPreferences.weights?.religion || 9);
  }

  // Education matching
  if (userPreferences.educations && userPreferences.educations.length > 0) {
    const educationScore = userPreferences.educations.some(edu => 
      candidateProfile.education.toLowerCase().includes(edu.toLowerCase())) ? 100 : 50;
    details.educationScore = educationScore;
    totalScore += educationScore * (userPreferences.weights?.education || 7);
    totalWeight += (userPreferences.weights?.education || 7);
  }

  // Occupation matching
  if (userPreferences.occupations && userPreferences.occupations.length > 0) {
    const occupationScore = userPreferences.occupations.some(occ => 
      candidateProfile.occupation.toLowerCase().includes(occ.toLowerCase())) ? 100 : 50;
    details.occupationScore = occupationScore;
    totalScore += occupationScore * (userPreferences.weights?.occupation || 6);
    totalWeight += (userPreferences.weights?.occupation || 6);
  }

  // Lifestyle matching
  if (userPreferences.diet && userPreferences.diet.length > 0) {
    const lifestyleScore = userPreferences.diet.includes(candidateProfile.diet) ? 100 : 50;
    details.lifestyleScore = lifestyleScore;
    totalScore += lifestyleScore * (userPreferences.weights?.lifestyle || 4);
    totalWeight += (userPreferences.weights?.lifestyle || 4);
  }

  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;

  return {
    score: finalScore,
    details
  };
};

// @desc    Get matches for user
// @route   GET /api/matches
// @access  Private
exports.getMatches = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, minScore = 50 } = req.query;

    // Get user's matches
    const matches = await Match.find({
      userId: req.user.id,
      matchScore: { $gte: parseInt(minScore) }
    })
      .populate({
        path: 'matchedUser',
        populate: {
          path: 'userId',
          select: 'email isVerified'
        }
      })
      .sort({ matchScore: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get profiles for matched users
    const matchedProfiles = await Promise.all(
      matches.map(async (match) => {
        const profile = await Profile.findOne({ userId: match.matchedUser });
        return {
          matchId: match._id,
          matchScore: match.matchScore,
          matchDetails: match.matchDetails,
          profile
        };
      })
    );

    const count = await Match.countDocuments({
      userId: req.user.id,
      matchScore: { $gte: parseInt(minScore) }
    });

    res.status(200).json({
      success: true,
      data: matchedProfiles.filter(m => m.profile !== null),
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

// @desc    Generate matches for user
// @route   POST /api/matches/generate
// @access  Private
exports.generateMatches = async (req, res, next) => {
  try {
    // Get user profile
    const userProfile = await Profile.findOne({ userId: req.user.id });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Please complete your profile first'
      });
    }

    // Get user preferences
    const userPreferences = await Preference.findOne({ userId: req.user.id });
    if (!userPreferences) {
      return res.status(404).json({
        success: false,
        message: 'Please set your preferences first'
      });
    }

    // Build query for potential matches
    const query = {
      userId: { $ne: req.user.id },
      gender: userPreferences.lookingFor
    };

    // Get all potential matches
    const potentialMatches = await Profile.find(query);

    // Clear existing matches
    await Match.deleteMany({ userId: req.user.id });

    // Calculate match scores
    const matches = [];
    for (const candidate of potentialMatches) {
      const { score, details } = calculateMatchScore(userProfile, candidate, userPreferences);
      
      if (score >= 30) { // Only save matches with score >= 30
        matches.push({
          userId: req.user.id,
          matchedUser: candidate.userId,
          matchScore: score,
          matchDetails: details
        });
      }
    }

    // Save matches
    if (matches.length > 0) {
      await Match.insertMany(matches);
    }

    res.status(200).json({
      success: true,
      message: `Generated ${matches.length} matches`,
      data: {
        totalMatches: matches.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark match as viewed
// @route   PUT /api/matches/:matchId/view
// @access  Private
exports.markAsViewed = async (req, res, next) => {
  try {
    const match = await Match.findOneAndUpdate(
      { _id: req.params.matchId, userId: req.user.id },
      { isViewed: true, viewedAt: Date.now() },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};