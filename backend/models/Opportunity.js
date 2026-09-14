const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an opportunity title'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['recruitment', 'trial', 'tournament', 'camp', 'workshop'],
      default: 'recruitment',
    },
    battingRole: {
      type: String,
      default: 'Opening Batter',
      trim: true,
    },
    battingStyle: {
      type: String,
      default: 'Either',
      trim: true,
    },
    ageGroup: {
      type: String,
      default: 'U19',
      trim: true,
    },
    experienceLevel: {
      type: String,
      default: 'Advanced',
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Please add opportunity details'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    creatorName: {
      type: String,
      default: 'Coach',
    },
    creatorTeam: {
      type: String,
      default: 'Delhi Cricket Club',
    },
    applicants: {
      type: Number,
      default: 0,
    },
    fee: {
      type: Number,
      default: 2000,
    },
    status: {
      type: String,
      enum: ['published', 'closed', 'deleted'],
      default: 'published',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

module.exports = Opportunity;
