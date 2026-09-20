const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { checkDuplicateClaim, validateRejectionReason } = require('../utils/fraudDetection');

// Handler for creating/applying for a scheme
const handleCreateApplication = async (req, res) => {
  try {
    const { schemeId, submittedByRole, applicantUserId, assistedUserId } = req.body;
    const userId = applicantUserId || assistedUserId || req.user._id;

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    // Duplicate check
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

    // Build document checklist
    const documentChecklist = scheme.requiredDocs ? scheme.requiredDocs.map(doc => ({
      docName: typeof doc === 'string' ? doc : doc.name,
      isUploaded: false,
      uploadedAt: null
    })) : [];

    const application = await Application.create({
      userId,
      schemeId,
      status: 'submitted',
      submittedAt: new Date(),
      statusHistory: [{
        status: 'submitted',
        timestamp: new Date(),
        changedBy: req.user._id,
        reason: 'Application submitted via matching engine'
      }],
      documentChecklist,
      submittedByRole: submittedByRole || (req.user.role === 'ngo_worker' || req.user.role === 'vle' ? 'vle' : 'applicant'),
      claimFingerprint: duplicateCheck.fingerprint || '',
      applicationDeadline: scheme.applyDeadline
    });

    await application.populate('schemeId');

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create application', error: error.message });
  }
};

// POST /api/applications/apply & POST /api/applications/
router.post('/apply', protect, handleCreateApplication);
router.post('/', protect, handleCreateApplication);

// GET /api/applications/my-applications & GET /api/applications/my
const handleGetMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('schemeId')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

router.get('/my-applications', protect, handleGetMyApplications);
router.get('/my', protect, handleGetMyApplications);

// GET /api/applications/all — admin / officer view
router.get('/all', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.schemeId) filter.schemeId = req.query.schemeId;

    const applications = await Application.find(filter)
      .populate('schemeId')
      .populate('userId', 'name email category gender location')
      .sort({ createdAt: -1 });

    res.json(applications);
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

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch application', error: error.message });
  }
});

// PUT /api/applications/:id/status & PATCH /api/applications/:id/status — update status
const handleUpdateStatus = async (req, res) => {
  try {
    const { status, comment, reason } = req.body;
    const application = await Application.findById(req.params.id).populate('schemeId');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const statusReason = comment || reason || `Status updated to ${status}`;

    application.status = status;
    application.statusHistory.push({
      status,
      timestamp: new Date(),
      changedBy: req.user._id,
      reason: statusReason
    });

    if (status === 'rejected') {
      application.rejectionReason = statusReason;
      application.rejectionCategory = req.body.rejectionCategory || 'other';

      const validation = validateRejectionReason(statusReason, application.schemeId);
      application.isRejectionValid = validation.isValid;
      application.rejectionFlagReason = validation.flagReason;
    }

    await application.save();
    await application.populate('userId', 'name email category gender');
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Status update failed', error: error.message });
  }
};

router.put('/:id/status', protect, handleUpdateStatus);
router.patch('/:id/status', protect, handleUpdateStatus);

module.exports = router;
