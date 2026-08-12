const mongoose = require('mongoose');

const AthleteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  position: { type: String },
  overallRating: { type: Number, default: 0 },
  stats: {
    speed: Number,
    agility: Number,
    endurance: Number
  },
  recentSessions: [{
    date: { type: Date, default: Date.now },
    title: String,
    score: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Athlete', AthleteSchema);
