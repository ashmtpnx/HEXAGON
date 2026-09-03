const crypto = require('crypto');
const Application = require('../models/Application');

/**
 * Fraud Detection — Duplicate Claim Fingerprinting
 * 
 * Research backing: CAG found ₹1.9 crore overpaid to duplicate beneficiaries
 * and ₹9 crore to untraceable beneficiaries. 12,122 unique bank accounts 
 * were reused for 52,000+ candidates.
 * 
 * This module creates a SHA-256 fingerprint from (aadhaarHash + schemeId)
 * to detect and block duplicate claims before submission.
 */

function generateClaimFingerprint(aadhaarHash, schemeId) {
  return crypto
    .createHash('sha256')
    .update(`${aadhaarHash}:${schemeId}`)
    .digest('hex');
}

async function checkDuplicateClaim(aadhaarHash, schemeId) {
  const fingerprint = generateClaimFingerprint(aadhaarHash, schemeId);

  const existing = await Application.findOne({
    claimFingerprint: fingerprint,
    status: { $nin: ['rejected'] }
  });

  if (existing) {
    return {
      isDuplicate: true,
      fingerprint,
      existingApplication: existing._id,
      existingStatus: existing.status,
      message: 'Duplicate claim detected. An active application for this scheme already exists under your identity.'
    };
  }

  return {
    isDuplicate: false,
    fingerprint,
    existingApplication: null,
    existingStatus: null,
    message: null
  };
}

/**
 * Validates rejection reasons against scheme rules.
 * Flags invalid rejections — e.g., "insufficient collateral" on a collateral-free loan.
 * 
 * Research backing: Documented bank reluctance to disburse collateral-free loans,
 * informal collateral demands despite CGTMSE coverage (2011–2026 unresolved).
 */
const INVALID_REJECTION_PATTERNS = [
  {
    pattern: /collateral|security|guarantee|mortgage|pledge/i,
    schemeTypes: ['loan'],
    flagReason: 'This scheme provides collateral-free loans. Rejection on grounds of "insufficient collateral" or "no security" is not a valid reason. The applicant has the right to escalate this decision.',
    flagCategory: 'collateral'
  },
  {
    pattern: /caste|community|religion|category/i,
    schemeTypes: ['loan', 'grant', 'subsidy', 'training', 'equity'],
    flagReason: 'Rejection on the basis of caste, community, or religion is unconstitutional and illegal. This has been flagged for immediate review.',
    flagCategory: 'discrimination'
  },
  {
    pattern: /gender|woman|female|male/i,
    schemeTypes: ['loan', 'grant', 'subsidy', 'training', 'equity'],
    flagReason: 'Gender-based rejection may be discriminatory. If the applicant meets the scheme criteria, this rejection should be reviewed.',
    flagCategory: 'discrimination'
  }
];

function validateRejectionReason(rejectionReason, scheme) {
  for (const rule of INVALID_REJECTION_PATTERNS) {
    if (rule.pattern.test(rejectionReason) && rule.schemeTypes.includes(scheme.schemeType)) {
      // Check if the scheme explicitly has rights about this
      const hasRelevantRight = scheme.applicantRights?.some(r =>
        rule.pattern.test(r.right) || rule.pattern.test(r.explanation)
      );

      return {
        isValid: false,
        flagReason: rule.flagReason,
        flagCategory: rule.flagCategory,
        hasApplicantRight: hasRelevantRight
      };
    }
  }

  return { isValid: true, flagReason: '', flagCategory: '', hasApplicantRight: false };
}

module.exports = { generateClaimFingerprint, checkDuplicateClaim, validateRejectionReason };
