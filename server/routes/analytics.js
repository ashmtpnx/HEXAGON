const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const Scheme = require('../models/Scheme');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * Ministry-Facing Analytics Dashboard Routes
 * 
 * Research backing: CAG found missing "monitoring infrastructure."
 * This module surfaces aggregate drop-off rates, rejection patterns,
 * duplicate claims caught, and systemic bias flags.
 */

// GET /api/analytics/overview
router.get('/overview', protect, roleCheck('admin'), async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const byStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = {};
    byStatus.forEach(s => { statusMap[s._id] = s.count; });

    const approvalRate = totalApplications > 0
      ? ((statusMap.approved || 0) / totalApplications * 100).toFixed(1)
      : 0;

    const totalUsers = await User.countDocuments({ role: 'applicant' });
    const assistedProfiles = await User.countDocuments({ isAssistedProfile: true });
    const duplicatesCaught = await Application.countDocuments({ duplicateFlag: true });
    const escalations = await Application.countDocuments({ escalationRequested: true });
    const invalidRejections = await Application.countDocuments({ isRejectionValid: false });

    res.json({
      totalApplications,
      statusBreakdown: statusMap,
      approvalRate: parseFloat(approvalRate),
      totalUsers,
      assistedProfiles,
      duplicatesCaught,
      escalations,
      invalidRejections,
    });
  } catch (error) {
    res.status(500).json({ message: 'Analytics failed', error: error.message });
  }
});

// GET /api/analytics/rejections — rejection patterns by category/scheme
router.get('/rejections', protect, roleCheck('admin'), async (req, res) => {
  try {
    // Rejection reasons by applicant category — surfaces bias
    const byCategory = await Application.aggregate([
      { $match: { status: 'rejected' } },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $group: {
          _id: { category: '$user.category', rejectionCategory: '$rejectionCategory' },
          count: { $sum: 1 },
          invalidCount: { $sum: { $cond: ['$isRejectionValid', 0, 1] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Rejection reasons by scheme
    const byScheme = await Application.aggregate([
      { $match: { status: 'rejected' } },
      { $lookup: { from: 'schemes', localField: 'schemeId', foreignField: '_id', as: 'scheme' } },
      { $unwind: '$scheme' },
      {
        $group: {
          _id: { scheme: '$scheme.name', rejectionCategory: '$rejectionCategory' },
          count: { $sum: 1 },
          invalidCount: { $sum: { $cond: ['$isRejectionValid', 0, 1] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Flagged (invalid) rejections
    const flagged = await Application.find({ isRejectionValid: false })
      .populate('schemeId', 'name')
      .populate('userId', 'name category gender')
      .select('rejectionReason rejectionFlagReason rejectionCategory status')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json({ byCategory, byScheme, flagged });
  } catch (error) {
    res.status(500).json({ message: 'Rejection analytics failed', error: error.message });
  }
});

// GET /api/analytics/bias-flags — automatic bias detection
router.get('/bias-flags', protect, roleCheck('admin'), async (req, res) => {
  try {
    // Calculate rejection rates per category
    const categoryStats = await Application.aggregate([
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.category',
          total: { $sum: 1 },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $eq: ['$status', 'escalated'] }, 1, 0] } },
          invalidRejections: { $sum: { $cond: ['$isRejectionValid', 0, 1] } }
        }
      }
    ]);

    // Flag if SC/ST rejection rate > 2× General category rate
    const generalStats = categoryStats.find(c => c._id === 'General');
    const generalRejRate = generalStats && generalStats.total > 0
      ? generalStats.rejected / generalStats.total : 0;

    const biasFlags = categoryStats
      .filter(c => c._id !== 'General' && c.total > 0)
      .map(c => {
        const rejRate = c.rejected / c.total;
        const isFlagged = generalRejRate > 0 && rejRate > generalRejRate * 2;
        return {
          category: c._id,
          totalApplications: c.total,
          rejectedCount: c.rejected,
          rejectionRate: (rejRate * 100).toFixed(1),
          generalRejectionRate: (generalRejRate * 100).toFixed(1),
          isFlagged,
          invalidRejections: c.invalidRejections,
          flagMessage: isFlagged
            ? `⚠️ ${c._id} category has a ${(rejRate * 100).toFixed(1)}% rejection rate — ${(rejRate / generalRejRate).toFixed(1)}× higher than General category (${(generalRejRate * 100).toFixed(1)}%). This may indicate systemic bias.`
            : null
        };
      });

    res.json({ categoryStats, biasFlags, generalRejectionRate: (generalRejRate * 100).toFixed(1) });
  } catch (error) {
    res.status(500).json({ message: 'Bias flag analytics failed', error: error.message });
  }
});

// GET /api/analytics/duplicates — duplicate claims log
router.get('/duplicates', protect, roleCheck('admin'), async (req, res) => {
  try {
    const duplicates = await Application.find({ duplicateFlag: true })
      .populate('schemeId', 'name')
      .populate('userId', 'name email category')
      .sort({ createdAt: -1 });

    res.json({ duplicates, totalCaught: duplicates.length });
  } catch (error) {
    res.status(500).json({ message: 'Duplicate analytics failed', error: error.message });
  }
});

// GET /api/analytics/dropoffs — drop-off funnel
router.get('/dropoffs', protect, roleCheck('admin'), async (req, res) => {
  try {
    const funnel = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const funnelMap = {};
    funnel.forEach(f => { funnelMap[f._id] = f.count; });

    const total = Object.values(funnelMap).reduce((s, v) => s + v, 0);

    res.json({
      funnel: {
        draft: funnelMap.draft || 0,
        submitted: funnelMap.submitted || 0,
        under_review: funnelMap.under_review || 0,
        approved: funnelMap.approved || 0,
        rejected: funnelMap.rejected || 0,
        escalated: funnelMap.escalated || 0,
      },
      total,
      completionRate: total > 0 ? (((funnelMap.submitted || 0) + (funnelMap.under_review || 0) + (funnelMap.approved || 0) + (funnelMap.rejected || 0) + (funnelMap.escalated || 0)) / total * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Drop-off analytics failed', error: error.message });
  }
});

// GET /api/analytics/timeline — application volume over time
router.get('/timeline', protect, roleCheck('admin'), async (req, res) => {
  try {
    const timeline = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$submittedAt" },
            month: { $month: "$submittedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format for frontend
    const formattedTimeline = timeline
      .filter(item => item._id.year && item._id.month)
      .map(item => ({
        name: `${item._id.month}/${item._id.year.toString().slice(-2)}`,
        applications: item.count
      }));

    res.json({ timeline: formattedTimeline });
  } catch (error) {
    res.status(500).json({ message: 'Timeline analytics failed', error: error.message });
  }
});

// GET /api/analytics/category-distribution — user categories
router.get('/category-distribution', protect, roleCheck('admin'), async (req, res) => {
  try {
    const distribution = await User.aggregate([
      { $match: { role: 'applicant' } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const formattedDistribution = distribution.map(item => ({
      name: item._id || 'Unknown',
      value: item.count
    }));

    res.json({ distribution: formattedDistribution });
  } catch (error) {
    res.status(500).json({ message: 'Category distribution analytics failed', error: error.message });
  }
});

// GET /api/analytics/grievance-stats — grievance resolution rate
router.get('/grievance-stats', protect, roleCheck('admin'), async (req, res) => {
  try {
    const appsWithGrievances = await Application.find({ 'grievanceThread.0': { $exists: true } });
    
    let resolvedCount = 0;
    
    appsWithGrievances.forEach(app => {
      // Check if any message in thread marks it as resolution
      const hasResolution = app.grievanceThread.some(msg => msg.isResolution);
      if (hasResolution) {
        resolvedCount++;
      }
    });
    
    const resolutionRate = appsWithGrievances.length > 0 
      ? ((resolvedCount / appsWithGrievances.length) * 100).toFixed(1) 
      : 0;

    res.json({ 
      totalGrievances: appsWithGrievances.length,
      resolvedGrievances: resolvedCount,
      resolutionRate: parseFloat(resolutionRate)
    });
  } catch (error) {
    res.status(500).json({ message: 'Grievance stats failed', error: error.message });
  }
});

module.exports = router;
