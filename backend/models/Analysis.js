const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    stroke: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    confidenceBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },
    scores: {
      overall: { type: Number, default: 0 },
      head: { type: Number, default: 0 },
      shoulder: { type: Number, default: 0 },
      elbow: { type: Number, default: 0 },
      hand: { type: Number, default: 0 },
      hip: { type: Number, default: 0 },
      knee: { type: Number, default: 0 },
      feet: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
      follow_through: { type: Number, default: 0 },
    },
    bodyAnalysis: {
      type: Object,
      default: {},
    },
    feedback: [
      {
        body_part: String,
        issue: String,
        severity: String,
        feedback: String,
      },
    ],
    coachingText: {
      type: String,
      default: '',
    },
    videoMetadata: {
      type: Object,
      default: {},
    },
    pdfFilename: {
      type: String,
      default: '',
    },
    pdfDownloadUrl: {
      type: String,
      default: '',
    },
    visualizations: {
      landmarkTrajectory: { type: String, default: '' },
      jointAngles: { type: String, default: '' },
      stability: { type: String, default: '' },
      scoreBreakdown: { type: String, default: '' },
      predictionConfidence: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Analysis', analysisSchema);
