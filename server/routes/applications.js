const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { checkDuplicateClaim, generateClaimFingerprint, validateRejectionReason } = require('../utils/fraudDetection');

// POST /api/applications — create new application
router.post('/', protect, async (req, res) => {
  try {
    const { schemeId, submittedByRole } = req.body;
    const userId = req.body.assistedUserId || req.user._id;

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    // Fraud check — duplicate claim detection
    const aadhaarHash = req.user.aadhaarHash || req.user._id.toString();
    const duplicateCheck = await checkDuplicateClaim(aadhaarHash, schemeId);

    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({
        message: duplicateCheck.message,
        duplicateFlag: true,
        existingApplicationId: duplicateCheck.existingApplication,
        existingStatus: duplicateCheck.existingStatus
      });
    }

    // Build document checklist from scheme requirements
    const documentChecklist = scheme.requiredDocs.map(doc => ({
      docName: doc.name,
      isUploaded: false,
      uploadedAt: null
    }));

    const application = await Application.create({
      userId,
      schemeId,
      status: 'draft',
      statusHistory: [{
        status: 'draft',
        timestamp: new Date(),
        changedBy: req.user._id,
        reason: 'Application created'
      }],
      documentChecklist,
      submittedByRole: submittedByRole || req.user.role === 'vle' ? 'vle' : 'applicant',
      claimFingerprint: duplicateCheck.fingerprint,
      applicationDeadline: scheme.applyDeadline
    });

    await application.populate('schemeId');

    res.status(201).json({ application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create application', error: error.message });
  }
});

// GET /api/applications/my — get current user's applications
router.get('/my', protect, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('schemeId')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

// GET /api/applications/all — admin: get all applications
router.get('/all', protect, roleCheck('admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.schemeId) filter.schemeId = req.query.schemeId;

    const applications = await Application.find(filter)
      .populate('schemeId')
      .populate('userId', 'name email category gender location')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

// GET /api/applications/:id — get single application
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('schemeId')
      .populate('userId', 'name email category gender location age businessStage sector annualIncome');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only allow owner, VLE, or admin to view
    if (req.user.role === 'applicant' && application.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch application', error: error.message });
  }
});

// PATCH /api/applications/:id/submit — submit a draft application
router.patch('/:id/submit', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft applications can be submitted' });
    }

    application.status = 'submitted';
    application.submittedAt = new Date();
    application.statusHistory.push({
      status: 'submitted',
      timestamp: new Date(),
      changedBy: req.user._id,
      reason: 'Application submitted for review'
    });

    await application.save();
    await application.populate('schemeId');
    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: 'Submission failed', error: error.message });
  }
});

// PATCH /api/applications/:id/status — admin: update status (approve/reject)
router.patch('/:id/status', protect, roleCheck('admin'), async (req, res) => {
  try {
    const { status, reason } = req.body;
    const application = await Application.findById(req.params.id).populate('schemeId');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Mandatory rejection reason
    if (status === 'rejected' && (!reason || reason.trim() === '')) {
      return res.status(400).json({
        message: 'A rejection reason is mandatory. This requirement exists to create an auditable record and protect applicant rights.'
      });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      timestamp: new Date(),
      changedBy: req.user._id,
      reason: reason || ''
    });

    // If rejected, validate the reason against scheme rights
    if (status === 'rejected') {
      application.rejectionReason = reason;
      application.rejectionCategory = req.body.rejectionCategory || 'other';

      const validation = validateRejectionReason(reason, application.schemeId);
      application.isRejectionValid = validation.isValid;
      application.rejectionFlagReason = validation.flagReason;
    }

    await application.save();
    await application.populate('userId', 'name email category gender');
    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: 'Status update failed', error: error.message });
  }
});

// PATCH /api/applications/:id/documents — update document checklist
router.patch('/:id/documents', protect, async (req, res) => {
  try {
    const { docName, isUploaded } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const doc = application.documentChecklist.find(d => d.docName === docName);
    if (doc) {
      doc.isUploaded = isUploaded;
      doc.uploadedAt = isUploaded ? new Date() : null;
    }

    await application.save();
    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: 'Document update failed', error: error.message });
  }
});

// POST /api/applications/:id/escalate — one-tap escalation
router.post('/:id/escalate', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('schemeId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.status !== 'rejected') {
      return res.status(400).json({ message: 'Only rejected applications can be escalated' });
    }

    const escalationLevel = application.escalationHistory.length + 1;
    const escalationAuthorities = [
      'Branch Manager',
      'Lead District Manager',
      'State Level Bankers Committee (SLBC)',
      'DFS Nodal Officer',
      'Ministry Grievance Cell'
    ];

    const authority = escalationAuthorities[Math.min(escalationLevel - 1, escalationAuthorities.length - 1)];

    application.escalationRequested = true;
    application.status = 'escalated';
    application.escalationHistory.push({
      level: escalationLevel,
      authority,
      requestedAt: new Date(),
      outcome: 'pending'
    });

    application.statusHistory.push({
      status: 'escalated',
      timestamp: new Date(),
      changedBy: req.user._id,
      reason: `Escalated to ${authority} (Level ${escalationLevel})`
    });

    await application.save();
    res.json({
      application,
      escalationMessage: `Your application has been escalated to ${authority}. Reference: ESC-${application._id.toString().slice(-6).toUpperCase()}-L${escalationLevel}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Escalation failed', error: error.message });
  }
});

module.exports = router;
