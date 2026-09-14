const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: ['athlete', 'coach', 'admin'],
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Technical Issue',
        'Video Upload Problem',
        'ML Analysis Problem',
        'Incorrect Result',
        'Account Problem',
        'Other',
      ],
      default: 'Other',
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject for the report'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
    },
    relatedAnalysisId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    adminResponse: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
