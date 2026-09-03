const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  ministry: { type: String, required: true },
  description: { type: String, required: true },
  schemeType: { type: String, enum: ['loan', 'grant', 'subsidy', 'training', 'equity'], required: true },

  eligibilityCriteria: {
    categories: [{ type: String, enum: ['SC', 'ST', 'OBC', 'General', 'Minority'] }],
    genders: [{ type: String, enum: ['Male', 'Female', 'Other'] }],
    ageRange: { min: { type: Number, default: 18 }, max: { type: Number, default: 100 } },
    maxIncome: { type: Number, default: Infinity },
    businessStages: [{ type: String, enum: ['idea', 'startup', 'growing', 'established'] }],
    sectors: [{ type: String, enum: ['manufacturing', 'services', 'trading', 'agriculture'] }],
    locationTypes: [{ type: String, enum: ['rural', 'urban'] }],
    minEducation: { type: String, default: null },
    requiresStreetVendor: { type: Boolean, default: false },
    requiresVendingCertificate: { type: Boolean, default: false },
    isGreenfield: { type: Boolean, default: false }
  },

  requiredDocs: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    isMandatory: { type: Boolean, default: true }
  }],

  benefits: {
    loanRange: { min: { type: Number, default: 0 }, max: { type: Number, default: 0 } },
    subsidyPercent: { type: Number, default: 0 },
    interestRate: { type: String, default: '' },
    description: { type: String, default: '' }
  },

  processSteps: [{
    stepNumber: Number,
    title: String,
    description: String,
    estimatedDays: Number
  }],

  // KEY DIFFERENTIATOR — Rights-awareness data
  applicantRights: [{
    right: { type: String, required: true },
    explanation: { type: String, required: true },
    escalationPath: { type: String, default: '' }
  }],

  applyDeadline: { type: Date, default: null },
  isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
