const Scheme = require('../models/Scheme');
const MatchLog = require('../models/MatchLog');

/**
 * Rule-based Scheme Matching Engine
 * 
 * Maps each user profile field against scheme eligibility criteria
 * and produces a weighted score with plain-language explanations.
 * 
 * Research backing: Replaces the need to navigate 33+ fragmented MoSJE portals.
 * CAG finding: Ensures validated matching to prevent ineligible claims.
 */

const EDUCATION_LEVELS = {
  'below_8th': 0,
  '8th_pass': 1,
  '10th_pass': 2,
  '12th_pass': 3,
  'graduate': 4,
  'postgraduate': 5,
};

async function findMatchingSchemes(user) {
  const schemes = await Scheme.find({ isActive: true });
  const results = [];

  for (const scheme of schemes) {
    const { matchScore, matchReasons, unmatchedReasons } = evaluateMatch(user, scheme);

    if (matchScore >= 40) {
      results.push({
        scheme,
        matchScore,
        matchReasons,
        unmatchedReasons,
      });

      // Save to MatchLog
      await MatchLog.create({
        userId: user._id,
        schemeId: scheme._id,
        matchScore,
        matchReasons,
        unmatchedReasons,
        matchedAt: new Date(),
      });
    }
  }

  // Sort by match score descending
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

function evaluateMatch(user, scheme) {
  const criteria = scheme.eligibilityCriteria;
  let score = 0;
  const matchReasons = [];
  const unmatchedReasons = [];

  // --- 1. Category Match (25 points) ---
  if (criteria.categories && criteria.categories.length > 0) {
    if (criteria.categories.includes(user.category)) {
      score += 25;
      matchReasons.push({
        field: 'category',
        matched: true,
        explanation: `You belong to the ${user.category} category, which is specifically targeted by this scheme.`
      });
    } else if (criteria.categories.includes('General')) {
      score += 15;
      matchReasons.push({
        field: 'category',
        matched: true,
        explanation: `This scheme is open to all categories including ${user.category}.`
      });
    } else {
      unmatchedReasons.push({
        field: 'category',
        explanation: `This scheme targets ${criteria.categories.join(', ')} categories. Your category (${user.category}) is not eligible.`
      });
    }
  } else {
    // No category restriction — open to all
    score += 25;
    matchReasons.push({
      field: 'category',
      matched: true,
      explanation: `This scheme is open to all categories.`
    });
  }

  // --- 2. Gender Match (15 points) ---
  if (criteria.genders && criteria.genders.length > 0) {
    if (criteria.genders.includes(user.gender)) {
      score += 15;
      const genderNote = criteria.genders.length === 1
        ? `This scheme specifically supports ${criteria.genders[0].toLowerCase()} entrepreneurs.`
        : `This scheme is open to your gender.`;
      matchReasons.push({ field: 'gender', matched: true, explanation: genderNote });
    } else {
      unmatchedReasons.push({
        field: 'gender',
        explanation: `This scheme is only for ${criteria.genders.join('/')} applicants.`
      });
    }
  } else {
    score += 15;
    matchReasons.push({ field: 'gender', matched: true, explanation: 'This scheme is open to all genders.' });
  }

  // --- 3. Age Match (15 points) ---
  if (criteria.ageRange) {
    const { min = 0, max = 100 } = criteria.ageRange;
    if (user.age >= min && user.age <= max) {
      score += 15;
      matchReasons.push({
        field: 'age',
        matched: true,
        explanation: `Your age (${user.age}) falls within the eligible range of ${min}–${max} years.`
      });
    } else {
      unmatchedReasons.push({
        field: 'age',
        explanation: `Age requirement: ${min}–${max} years. Your age: ${user.age}.`
      });
    }
  } else {
    score += 15;
    matchReasons.push({ field: 'age', matched: true, explanation: 'No age restriction for this scheme.' });
  }

  // --- 4. Income Match (15 points) ---
  if (criteria.maxIncome && criteria.maxIncome < Infinity && criteria.maxIncome > 0) {
    if (user.annualIncome <= criteria.maxIncome) {
      score += 15;
      matchReasons.push({
        field: 'income',
        matched: true,
        explanation: `Your annual income (₹${user.annualIncome.toLocaleString('en-IN')}) is within the ₹${criteria.maxIncome.toLocaleString('en-IN')} ceiling.`
      });
    } else {
      unmatchedReasons.push({
        field: 'income',
        explanation: `Income ceiling: ₹${criteria.maxIncome.toLocaleString('en-IN')}. Your income: ₹${user.annualIncome.toLocaleString('en-IN')}.`
      });
    }
  } else {
    score += 15;
    matchReasons.push({ field: 'income', matched: true, explanation: 'No income restriction for this scheme.' });
  }

  // --- 5. Business Stage Match (15 points) ---
  if (criteria.businessStages && criteria.businessStages.length > 0) {
    if (criteria.businessStages.includes(user.businessStage)) {
      score += 15;
      matchReasons.push({
        field: 'businessStage',
        matched: true,
        explanation: `Your business stage ("${user.businessStage}") matches the scheme's requirement.`
      });
    } else {
      unmatchedReasons.push({
        field: 'businessStage',
        explanation: `This scheme is for businesses at stage: ${criteria.businessStages.join(', ')}. Your stage: ${user.businessStage}.`
      });
    }
  } else {
    score += 15;
    matchReasons.push({ field: 'businessStage', matched: true, explanation: 'No business stage restriction.' });
  }

  // --- 6. Sector Match (10 points) ---
  if (criteria.sectors && criteria.sectors.length > 0) {
    if (criteria.sectors.includes(user.sector)) {
      score += 10;
      matchReasons.push({
        field: 'sector',
        matched: true,
        explanation: `Your sector (${user.sector}) is supported by this scheme.`
      });
    } else {
      unmatchedReasons.push({
        field: 'sector',
        explanation: `This scheme supports: ${criteria.sectors.join(', ')}. Your sector: ${user.sector}.`
      });
    }
  } else {
    score += 10;
    matchReasons.push({ field: 'sector', matched: true, explanation: 'All business sectors are eligible.' });
  }

  // --- 7. Location Match (5 points) ---
  if (criteria.locationTypes && criteria.locationTypes.length > 0) {
    const userLocType = user.location?.isRural ? 'rural' : 'urban';
    if (criteria.locationTypes.includes(userLocType) || criteria.locationTypes.length === 2) {
      score += 5;
      matchReasons.push({
        field: 'location',
        matched: true,
        explanation: `Your location type (${userLocType}) is eligible.`
      });
    } else {
      unmatchedReasons.push({
        field: 'location',
        explanation: `This scheme targets ${criteria.locationTypes.join('/')} areas. You are in a ${userLocType} area.`
      });
    }
  } else {
    score += 5;
    matchReasons.push({ field: 'location', matched: true, explanation: 'No location restriction.' });
  }

  // --- Special criteria checks (can reduce score to 0 if hard requirements fail) ---

  // Greenfield requirement
  if (criteria.isGreenfield && user.businessStage !== 'idea' && user.businessStage !== 'startup') {
    score = Math.max(0, score - 30);
    unmatchedReasons.push({
      field: 'greenfield',
      explanation: 'This scheme requires a greenfield (new) venture. Your business appears to be already established.'
    });
  }

  // Street vendor requirement
  if (criteria.requiresStreetVendor && !user.isStreetVendor) {
    score = 0;
    unmatchedReasons.push({
      field: 'streetVendor',
      explanation: 'This scheme is exclusively for street vendors.'
    });
  }

  // Education requirement
  if (criteria.minEducation) {
    const userLevel = EDUCATION_LEVELS[user.educationLevel] || 0;
    const requiredLevel = EDUCATION_LEVELS[criteria.minEducation] || 0;
    if (userLevel < requiredLevel) {
      score = Math.max(0, score - 20);
      unmatchedReasons.push({
        field: 'education',
        explanation: `Minimum education required: ${criteria.minEducation.replace('_', ' ')}. Your level: ${user.educationLevel.replace('_', ' ')}.`
      });
    }
  }

  return { matchScore: Math.min(score, 100), matchReasons, unmatchedReasons };
}

module.exports = { findMatchingSchemes, evaluateMatch };
