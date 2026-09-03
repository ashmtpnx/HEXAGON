const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['applicant', 'vle', 'admin'], default: 'applicant' },

  // Demographics — used for scheme matching
  category: {
    type: String,
    enum: ['SC', 'ST', 'OBC', 'General', 'Minority'],
    required: function () { return this.role === 'applicant'; }
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: function () { return this.role === 'applicant'; }
  },
  age: { type: Number, min: 18, max: 100 },

  // Business context
  businessStage: {
    type: String,
    enum: ['idea', 'startup', 'growing', 'established'],
    default: 'idea'
  },
  sector: {
    type: String,
    enum: ['manufacturing', 'services', 'trading', 'agriculture'],
    default: 'services'
  },

  // Location
  location: {
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    isRural: { type: Boolean, default: true }
  },

  annualIncome: { type: Number, default: 0 },

  // Identity — stored as hash, never raw
  aadhaarHash: { type: String, default: '' },

  // Assisted mode flags
  isAssistedProfile: { type: Boolean, default: false },
  assistedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Education level — for PMEGP eligibility
  educationLevel: {
    type: String,
    enum: ['below_8th', '8th_pass', '10th_pass', '12th_pass', 'graduate', 'postgraduate'],
    default: '10th_pass'
  },

  // Street vendor flag — for PM SVANidhi
  isStreetVendor: { type: Boolean, default: false },
  hasVendingCertificate: { type: Boolean, default: false },

}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
