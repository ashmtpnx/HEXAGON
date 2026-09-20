const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { findMatchingSchemes } = require('../utils/matchEngine');
const MatchLog = require('../models/MatchLog');
const User = require('../models/User');

// Helper to format match engine output for frontend component
function formatMatches(results) {
  return results.map(r => ({
    scheme: r.scheme,
    matchPercentage: r.matchScore || 0,
    matchReasons: r.matchReasons ? r.matchReasons.map(mr => typeof mr === 'string' ? mr : mr.explanation) : [],
    missingRequirements: r.unmatchedReasons ? r.unmatchedReasons.map(ur => typeof ur === 'string' ? ur : ur.explanation) : [],
  }));
}

// GET /api/match/me — run matching engine for current logged in user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.age) user.age = 30;

    const results = await findMatchingSchemes(user);
    res.json({
      totalSchemes: results.length,
      matches: formatMatches(results)
    });
  } catch (error) {
    res.status(500).json({ message: 'Matching failed', error: error.message });
  }
});

// GET /api/match/user/:userId — run matching engine for specific user (assisted mode)
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ message: 'Assisted user not found' });
    if (!targetUser.age) targetUser.age = 30;

    const results = await findMatchingSchemes(targetUser);
    res.json({
      totalSchemes: results.length,
      matches: formatMatches(results)
    });
  } catch (error) {
    res.status(500).json({ message: 'Matching failed', error: error.message });
  }
});

// POST /api/match/find — run matching engine for current user or assisted user
router.post('/find', protect, async (req, res) => {
  try {
    let targetUser = req.user;
    if ((req.user.role === 'vle' || req.user.role === 'ngo_worker') && req.body.assistedUserId) {
      targetUser = await User.findById(req.body.assistedUserId);
      if (!targetUser) return res.status(404).json({ message: 'Assisted user not found' });
    }
    if (!targetUser.age) targetUser.age = 30;

    const results = await findMatchingSchemes(targetUser);
    res.json({
      totalSchemes: results.length,
      matches: formatMatches(results)
    });
  } catch (error) {
    res.status(500).json({ message: 'Matching failed', error: error.message });
  }
});

// GET /api/match/history — get match history for current user
router.get('/history', protect, async (req, res) => {
  try {
    const logs = await MatchLog.find({ userId: req.user._id })
      .populate('schemeId')
      .sort({ matchedAt: -1 })
      .limit(50);

    res.json({ matchHistory: logs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch match history', error: error.message });
  }
});

module.exports = router;
