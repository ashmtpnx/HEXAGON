const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');

// POST /api/applications/:id/grievance — add grievance message
router.post('/:id/grievance', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Grievance message is required' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.grievanceThread.push({
      message: message.trim(),
      author: req.user._id,
      authorName: req.user.name,
      role: req.user.role,
      timestamp: new Date(),
      isResolution: req.body.isResolution || false
    });

    await application.save();
    res.json({ grievanceThread: application.grievanceThread });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add grievance', error: error.message });
  }
});

// GET /api/grievances/all — admin: get all applications with active grievances
router.get('/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const applications = await Application.find({
      'grievanceThread.0': { $exists: true }
    })
      .populate('schemeId', 'name ministry')
      .populate('userId', 'name email category gender location')
      .sort({ updatedAt: -1 });

    res.json({ grievances: applications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch grievances', error: error.message });
  }
});

module.exports = router;
