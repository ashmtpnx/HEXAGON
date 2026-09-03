const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },

  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'escalated'],
    default: 'draft'
  },

  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, default: '' }
  }],

  documentChecklist: [{
    docName: String,
    isUploaded: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: null }
  }],

  submittedByRole: { type: String, enum: ['applicant', 'vle'], default: 'applicant' },

  // Rejection tracking — mandatory reason disclosure
  rejectionReason: { type: String, default: '' },
  rejectionCategory: {
    type: String,
    enum: ['eligibility', 'documents', 'capacity', 'collateral', 'other', ''],
    default: ''
  },
  isRejectionValid: { type: Boolean, default: true },
  rejectionFlagReason: { type: String, default: '' },

  // Escalation
  escalationRequested: { type: Boolean, default: false },
  escalationHistory: [{
    level: Number,
    authority: String,
    requestedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    outcome: { type: String, default: 'pending' }
  }],

  // In-context grievance thread
  grievanceThread: [{
    message: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: '' },
    role: { type: String, enum: ['applicant', 'vle', 'admin'], default: 'applicant' },
    timestamp: { type: Date, default: Date.now },
    isResolution: { type: Boolean, default: false }
  }],

  // Fraud detection
  duplicateFlag: { type: Boolean, default: false },
  claimFingerprint: { type: String, default: '' },

  // Deadline
  applicationDeadline: { type: Date, default: null },
  submittedAt: { type: Date, default: null },

}, { timestamps: true });

// Index for duplicate detection
applicationSchema.index({ claimFingerprint: 1 });
applicationSchema.index({ userId: 1, schemeId: 1 });

module.exports = mongoose.model('Application', applicationSchema);
