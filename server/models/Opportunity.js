const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  coachId: { type: String },
  sport: { type: String },
  status: { type: String, default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', OpportunitySchema);
