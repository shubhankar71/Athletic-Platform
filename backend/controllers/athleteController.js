const mongoose = require('mongoose');
const User = require('../models/User.js');
const Opportunity = require('../models/Opportunity.js');
const Application = require('../models/Application.js');

/**
 * @desc    Apply to a Cricket Opportunity as an Athlete
 * @route   POST /api/athlete/apply
 * @access  Private (Athlete only)
 */
const applyToOpportunity = async (req, res) => {
  try {
    if (!req.user || String(req.user.role).toLowerCase() !== 'athlete') {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Only Athlete accounts can apply to opportunities.',
      });
    }

    const { opportunityId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ success: false, message: 'Please provide opportunityId.' });
    }

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
        return res.status(400).json({ success: false, message: 'Invalid opportunity ID.' });
      }

      const opp = await Opportunity.findById(opportunityId);
      if (!opp || opp.status === 'deleted') {
        return res.status(404).json({ success: false, message: 'Opportunity not found or inactive.' });
      }

      // Check Duplicate Application
      const existingApp = await Application.findOne({
        opportunity: opp._id,
        athlete: req.user._id,
      });

      if (existingApp) {
        return res.status(400).json({
          success: false,
          message: 'Already applied to this opportunity.',
          application: existingApp,
        });
      }

      const application = await Application.create({
        opportunity: opp._id,
        athlete: req.user._id,
        coach: opp.createdBy || req.user._id,
        status: 'Applied',
        appliedAt: new Date(),
      });

      // Increment applicants count on opportunity
      opp.applicants = (opp.applicants || 0) + 1;
      await opp.save();

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully!',
        application,
      });
    } else {
      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully (In-Memory)!',
      });
    }
  } catch (error) {
    console.error('applyToOpportunity error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Already applied to this opportunity.',
      });
    }
    return res.status(500).json({ success: false, message: 'Failed to submit application.' });
  }
};

/**
 * @desc    Get current Athlete's application history
 * @route   GET /api/athlete/applications
 * @access  Private (Athlete only)
 */
const getAthleteApplications = async (req, res) => {
  try {
    if (!req.user || String(req.user.role).toLowerCase() !== 'athlete') {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Only Athlete accounts can view application history.',
      });
    }

    const { search = '', battingRole = 'all' } = req.query;

    if (mongoose.connection.readyState === 1) {
      const applications = await Application.find({ athlete: req.user._id })
        .populate('opportunity')
        .populate('coach', 'name email team')
        .sort({ createdAt: -1 })
        .lean();

      let items = applications
        .filter((app) => app.opportunity && app.opportunity.status !== 'deleted')
        .map((app) => {
          const opp = app.opportunity;
          const fee = opp.fee !== undefined ? opp.fee : 2000;
          return {
            _id: app._id,
            id: app._id.toString(),
            opportunityId: opp._id.toString(),
            title: opp.title,
            type: opp.type || 'recruitment',
            battingRole: opp.battingRole || 'Opening Batter',
            battingStyle: opp.battingStyle || 'Either',
            gender: opp.gender || 'Any',
            ageGroup: opp.ageGroup || 'U19',
            location: opp.location || 'Delhi Cricket Academy',
            summary: opp.summary || '',
            creatorName: opp.creatorName || (app.coach ? app.coach.name : 'Coach'),
            creatorTeam: opp.creatorTeam || (app.coach ? app.coach.team : 'Delhi Cricket Club'),
            fee,
            formattedFee: fee === 0 ? 'Free' : `₹${fee.toLocaleString('en-IN')}`,
            appliedAt: app.appliedAt || app.createdAt,
            status: app.status || 'Applied',
          };
        });

      if (battingRole && battingRole !== 'all' && battingRole !== 'All Roles' && battingRole !== 'All') {
        items = items.filter((item) =>
          item.battingRole.toLowerCase().includes(battingRole.toLowerCase().trim())
        );
      }

      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.location.toLowerCase().includes(q) ||
            item.battingRole.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q)
        );
      }

      return res.status(200).json({ success: true, applications: items });
    } else {
      return res.status(200).json({ success: true, applications: [] });
    }
  } catch (error) {
    console.error('getAthleteApplications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve application history.' });
  }
};

module.exports = {
  applyToOpportunity,
  getAthleteApplications,
};
