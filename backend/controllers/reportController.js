const mongoose = require('mongoose');
const Report = require('../models/Report.js');

/**
 * @desc    Submit a new issue/report (Athletes & Coaches)
 * @route   POST /api/reports
 * @access  Private (Athlete or Coach)
 */
const createReport = async (req, res) => {
  try {
    const { category, subject, description, relatedAnalysisId } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both subject and description for the report.',
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const report = await Report.create({
      user: req.user._id,
      userName: req.user.name || 'Anonymous User',
      userEmail: req.user.email || 'user@example.com',
      userRole: req.user.role || 'athlete',
      category: category || 'Other',
      subject: subject.trim(),
      description: description.trim(),
      relatedAnalysisId: relatedAnalysisId || '',
      status: 'open',
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our support team will review it shortly.',
      report,
    });
  } catch (error) {
    console.error('createReport error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit report. Please try again.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all reports with role/status filters & search
 * @route   GET /api/reports/admin/all
 * @access  Private (Admin only)
 */
const getReports = async (req, res) => {
  try {
    const { role = 'all', status = 'all', search = '' } = req.query;

    const filter = {};

    if (role === 'athlete' || role === 'coach') {
      filter.userRole = role;
    }

    if (['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { userName: regex },
        { userEmail: regex },
        { subject: regex },
        { category: regex },
      ];
    }

    const reports = await Report.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    const unresolvedCount = await Report.countDocuments({
      status: { $in: ['open', 'in_progress'] },
    });

    return res.status(200).json({
      success: true,
      reports,
      unresolvedCount,
    });
  } catch (error) {
    console.error('getReports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reports list.',
    });
  }
};

/**
 * @desc    Get unresolved report count for badge indicator
 * @route   GET /api/reports/admin/unresolved-count
 * @access  Private (Admin only)
 */
const getUnresolvedCount = async (req, res) => {
  try {
    const count = await Report.countDocuments({
      status: { $in: ['open', 'in_progress'] },
    });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    return res.status(200).json({ success: true, count: 0 });
  }
};

/**
 * @desc    Get single report by ID
 * @route   GET /api/reports/admin/:id
 * @access  Private (Admin only)
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID.' });
    }

    const report = await Report.findById(id).populate('user', 'name email role');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    return res.status(200).json({ success: true, report });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch report details.' });
  }
};

/**
 * @desc    Update report status and admin response
 * @route   PATCH /api/reports/admin/:id
 * @access  Private (Admin only)
 */
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID.' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (status && ['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      report.status = status;
    }

    if (adminResponse !== undefined) {
      report.adminResponse = adminResponse.trim();
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      report,
    });
  } catch (error) {
    console.error('updateReport error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update report.',
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getUnresolvedCount,
  getReportById,
  updateReport,
};
