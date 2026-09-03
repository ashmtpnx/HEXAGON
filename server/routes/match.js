const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { findMatchingSchemes } = require('../utils/matchEngine');
const MatchLog = require('../models/MatchLog');
const User = require('../models/User');

// POST /api/match/find — run the matching engine for current user
router.post('/find', protect, async (req, res) => {
  try {
    let targetUser = req.user;

    // VLEs can match on behalf of an assisted user
    if (req.user.role === 'vle' && req.body.assistedUserId) {
      targetUser = await User.findById(req.body.assistedUserId);
      if (!targetUser) {
        return res.status(404).json({ message: 'Assisted user not found' });
      }
    }

    const results = await findMatchingSchemes(targetUser);

    res.json({
      totalSchemes: results.length,
      matches: results.map(r => ({
        scheme: r.scheme,
        matchScore: r.matchScore,
        matchReasons: r.matchReasons,
        unmatchedReasons: r.unmatchedReasons,
      }))
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
