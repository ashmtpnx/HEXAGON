const mongoose = require('mongoose');

const matchLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  matchScore: { type: Number, min: 0, max: 100, required: true },

  matchReasons: [{
    field: String,
    matched: Boolean,
    explanation: String
  }],

  unmatchedReasons: [{
    field: String,
    explanation: String
  }],

  matchedAt: { type: Date, default: Date.now }
}, { timestamps: true });

matchLogSchema.index({ userId: 1, matchedAt: -1 });

module.exports = mongoose.model('MatchLog', matchLogSchema);
