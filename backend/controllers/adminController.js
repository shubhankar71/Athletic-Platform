const mongoose = require('mongoose');
const User = require('../models/User.js');
const Analysis = require('../models/Analysis.js');

/**
 * Get overall administrative statistics with in-memory fallback
 */
const getAdminStats = async (req, res) => {
  try {
    let totalUsers = 1;
    let totalAthletes = 1;
    let totalAdmins = 1;
    let totalAnalyses = 0;
    let completedAnalyses = 0;
    let processingAnalyses = 0;
    let failedAnalyses = 0;
    let recentUsers = [];
    let recentAnalyses = [];

    if (mongoose.connection.readyState === 1) {
      totalUsers = await User.countDocuments();
      totalAthletes = await User.countDocuments({ role: 'athlete' });
      totalAdmins = await User.countDocuments({ role: 'admin' });

      totalAnalyses = await Analysis.countDocuments();
      completedAnalyses = await Analysis.countDocuments({ status: 'completed' });
      processingAnalyses = await Analysis.countDocuments({ status: 'processing' });
      failedAnalyses = await Analysis.countDocuments({ status: 'failed' });

      recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(10);
      recentAnalyses = await Analysis.find().sort({ createdAt: -1 }).limit(10);
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAthletes,
        totalAdmins,
        totalAnalyses,
        completedAnalyses,
        processingAnalyses,
        failedAnalyses,
      },
      recentUsers,
      recentAnalyses,
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin statistics.',
    });
  }
};

/**
 * Get list of all registered users
 */
const getAllUsers = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, users });
    }
    return res.status(200).json({ success: true, users: [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve users list.' });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
};
