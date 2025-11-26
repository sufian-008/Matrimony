const jwt = require('jsonwebtoken');

exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

exports.calculateMatchScore = (profile, preference) => {
  let score = 0;
  let totalCriteria = 0;

  // Age matching (20 points)
  const age = exports.calculateAge(profile.personalInfo.dateOfBirth);
  if (age >= preference.ageRange.min && age <= preference.ageRange.max) {
    score += 20;
  }
  totalCriteria += 20;

  // Height matching (10 points)
  if (preference.heightRange && preference.heightRange.min && preference.heightRange.max) {
    if (profile.personalInfo.height >= preference.heightRange.min && 
        profile.personalInfo.height <= preference.heightRange.max) {
      score += 10;
    }
    totalCriteria += 10;
  }

  // Marital status (15 points)
  if (preference.maritalStatus && preference.maritalStatus.length > 0) {
    if (preference.maritalStatus.includes(profile.personalInfo.maritalStatus)) {
      score += 15;
    }
    totalCriteria += 15;
  }

  // Location matching (15 points)
  if (preference.location.countries && preference.location.countries.length > 0) {
    if (preference.location.countries.includes(profile.location.country)) {
      score += 15;
    }
    totalCriteria += 15;
  }

  // Religion matching (15 points)
  if (preference.religion && preference.religion.length > 0) {
    if (preference.religion.includes(profile.religiousInfo.religion)) {
      score += 15;
    }
    totalCriteria += 15;
  }

  // Education matching (10 points)
  if (preference.education && preference.education.length > 0) {
    if (preference.education.includes(profile.professionalInfo.education)) {
      score += 10;
    }
    totalCriteria += 10;
  }

  // Occupation matching (10 points)
  if (preference.occupation && preference.occupation.length > 0) {
    if (preference.occupation.includes(profile.professionalInfo.occupation)) {
      score += 10;
    }
    totalCriteria += 10;
  }

  // Lifestyle - Diet (5 points)
  if (preference.diet && preference.diet.length > 0) {
    if (preference.diet.includes(profile.lifestyle.diet) || preference.diet.includes('doesnt_matter')) {
      score += 5;
    }
    totalCriteria += 5;
  }

  // Calculate percentage
  return totalCriteria > 0 ? Math.round((score / totalCriteria) * 100) : 0;
};
