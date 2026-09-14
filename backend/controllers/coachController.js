const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const Analysis = require('../models/Analysis.js');
const Opportunity = require('../models/Opportunity.js');
const Application = require('../models/Application.js');

// In-memory fallback opportunities for dev testing when MongoDB connection is inactive
const inMemoryOpportunities = [];

/**
 * Helper to decode user role from JWT token in request headers safely
 */
function getRequesterRole(req) {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  if (!authHeader) return null;
  try {
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production');
    return decoded && decoded.role ? String(decoded.role).toLowerCase() : null;
  } catch (e) {
    return null;
  }
}

/**
 * @desc    Get cricket applicants roster for Coach (Only athletes who applied to Coach's opportunities)
 * @route   GET /api/coach/athletes
 * @access  Private (Coach & Admin)
 */
const getCoachAthletes = async (req, res) => {
  try {
    const { search = '', battingRole = 'all' } = req.query;

    if (mongoose.connection.readyState === 1) {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      // If user is Admin, they can see all applicants or all athletes
      const isCoach = String(req.user.role).toLowerCase() === 'coach';
      
      let applications = [];
      if (isCoach) {
        // Query applications for opportunities owned by THIS logged-in coach
        applications = await Application.find({ coach: req.user._id })
          .populate('athlete', '-password')
          .populate('opportunity')
          .sort({ createdAt: -1 })
          .lean();
      } else {
        // Admin view: all applications
        applications = await Application.find()
          .populate('athlete', '-password')
          .populate('opportunity')
          .sort({ createdAt: -1 })
          .lean();
      }

      // Map applications into enriched roster entries
      let enrichedAthletes = await Promise.all(
        applications
          .filter((app) => app.athlete && !app.athlete.isDeleted)
          .map(async (app) => {
            const ath = app.athlete;
            const opp = app.opportunity || {};

            const analyses = await Analysis.find({ user: ath._id })
              .sort({ createdAt: -1 })
              .limit(2)
              .lean();

            let lastScore = ath.lastSessionScore || 78;
            let trend = 'flat';

            if (analyses.length > 0) {
              const latest = analyses[0];
              if (latest.scores && typeof latest.scores.overallScore === 'number') {
                lastScore = Math.round(latest.scores.overallScore);
              }
              if (analyses.length >= 2) {
                const prev = analyses[1];
                const prevScore = (prev.scores && prev.scores.overallScore) || 75;
                if (lastScore > prevScore) trend = 'up';
                else if (lastScore < prevScore) trend = 'down';
              }
            }

            return {
              _id: app._id,
              id: app._id.toString(),
              applicationId: app._id.toString(),
              athleteId: ath._id.toString(),
              name: ath.name,
              email: ath.email,
              gender: ath.gender || 'Male',
              battingRole: ath.battingRole || 'Opening Batter',
              battingStyle: ath.battingStyle || 'Right-Handed',
              team: ath.team || 'Delhi Cricket Club',
              opportunityTitle: opp.title || 'Cricket Trial',
              opportunityRole: opp.battingRole || 'Opening Batter',
              opportunityId: opp._id ? opp._id.toString() : null,
              applicationDate: app.appliedAt || app.createdAt,
              status: app.status || 'Applied',
              lastSessionScore: lastScore,
              trend,
              flagged: lastScore < 70,
              createdAt: app.createdAt,
            };
          })
      );

      // Batting role filter
      if (battingRole && !['all', 'all batters', 'all roles'].includes(battingRole.toLowerCase().trim())) {
        enrichedAthletes = enrichedAthletes.filter((a) =>
          a.battingRole.toLowerCase().includes(battingRole.toLowerCase().trim())
        );
      }

      // Search filter (name, email, battingRole, battingStyle, opportunityTitle)
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        enrichedAthletes = enrichedAthletes.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.email.toLowerCase().includes(q) ||
            a.battingRole.toLowerCase().includes(q) ||
            a.battingStyle.toLowerCase().includes(q) ||
            a.opportunityTitle.toLowerCase().includes(q)
        );
      }

      return res.status(200).json({ success: true, athletes: enrichedAthletes });
    } else {
      return res.status(200).json({ success: true, athletes: [] });
    }
  } catch (error) {
    console.error('getCoachAthletes error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve cricket applicant roster.' });
  }
};

/**
 * @desc    Get list of ALL cricket opportunities posted by ALL coaches with Server-Side Role-Based Fee Projection
 * @route   GET /api/coach/opportunities
 * @access  Public / Private (Athletes see fee, Coaches do NOT see fee)
 */
const getOpportunities = async (req, res) => {
  try {
    const { search = '', battingRole = 'all', type = 'all' } = req.query;
    const requesterRole = req.user ? String(req.user.role).toLowerCase() : getRequesterRole(req);
    const isAthlete = requesterRole === 'athlete';

    let rawOpps = [];

    if (mongoose.connection.readyState === 1) {
      const filter = { status: { $ne: 'deleted' } };
      const conditions = [];

      const cleanRole = battingRole ? battingRole.toLowerCase().trim() : 'all';
      if (cleanRole && !['all', 'all roles', 'all batters'].includes(cleanRole)) {
        const escapedRole = cleanRole.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        conditions.push({ battingRole: { $regex: escapedRole, $options: 'i' } });
      }

      const cleanType = type ? type.toLowerCase().trim() : 'all';
      if (cleanType && !['all'].includes(cleanType)) {
        conditions.push({ type: cleanType });
      }

      if (search && search.trim() !== '') {
        const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        conditions.push({
          $or: [
            { title: { $regex: cleanSearch, $options: 'i' } },
            { location: { $regex: cleanSearch, $options: 'i' } },
            { summary: { $regex: cleanSearch, $options: 'i' } },
            { battingRole: { $regex: cleanSearch, $options: 'i' } },
            { type: { $regex: cleanSearch, $options: 'i' } },
            { creatorName: { $regex: cleanSearch, $options: 'i' } },
            { creatorTeam: { $regex: cleanSearch, $options: 'i' } },
          ],
        });
      }

      if (conditions.length > 0) {
        filter.$and = conditions;
      }

      rawOpps = await Opportunity.find(filter)
        .sort({ createdAt: -1 })
        .lean();
    } else {
      let list = [...inMemoryOpportunities];
      const cleanRole = battingRole ? battingRole.toLowerCase().trim() : 'all';
      if (cleanRole && !['all', 'all roles', 'all batters'].includes(cleanRole)) {
        list = list.filter((o) =>
          o.battingRole && o.battingRole.toLowerCase().includes(cleanRole)
        );
      }
      const cleanType = type ? type.toLowerCase().trim() : 'all';
      if (cleanType && !['all'].includes(cleanType)) {
        list = list.filter((o) => o.type && o.type.toLowerCase() === cleanType);
      }
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.location.toLowerCase().includes(q) ||
            o.summary.toLowerCase().includes(q) ||
            (o.battingRole && o.battingRole.toLowerCase().includes(q))
        );
      }
      rawOpps = list;
    }

    // SERVER-SIDE ROLE-BASED FIELD PROJECTION:
    // Fee is visible ONLY to Athletes. Strip/omit `fee` completely for Coach requests.
    const processedOpps = rawOpps.map((opp) => {
      const item = { ...opp };
      if (!isAthlete) {
        delete item.fee;
        delete item.formattedFee;
      } else {
        item.fee = item.fee !== undefined ? item.fee : 2000;
        item.formattedFee = item.fee === 0 ? 'Free' : `₹${item.fee.toLocaleString('en-IN')}`;
      }
      return item;
    });

    return res.status(200).json({ success: true, opportunities: processedOpps });
  } catch (error) {
    console.error('getOpportunities error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve opportunities.' });
  }
};

/**
 * @desc    Create a new cricket opportunity (Recruitment or Trial ONLY)
 * @route   POST /api/coach/opportunities
 * @access  Private (Coach only)
 */
const createOpportunity = async (req, res) => {
  try {
    // 1. Strict Server-Side Role Verification: Athletes CANNOT create opportunities
    if (!req.user || String(req.user.role).toLowerCase() !== 'coach') {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Only Coach accounts can publish opportunities.',
      });
    }

    const {
      title,
      type = 'recruitment',
      battingRole = 'Opening Batter',
      battingStyle = 'Either',
      ageGroup = 'U19',
      experienceLevel = 'Advanced',
      location = 'Delhi Cricket Academy',
      summary = '',
      fee = 2000,
    } = req.body;

    // 2. Strict Type Validation: Coach can ONLY post 'recruitment' or 'trial'
    const cleanType = String(type).toLowerCase().trim();
    if (!['recruitment', 'trial'].includes(cleanType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid opportunity type '${type}'. Coaches are strictly restricted to publishing 'recruitment' or 'trial' opportunities only.`,
      });
    }

    if (!title || !summary || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, location, and details/summary.',
      });
    }

    const creatorName = req.user.name || 'Coach';
    const creatorTeam = req.user.team || 'Delhi Cricket Academy';

    if (mongoose.connection.readyState === 1) {
      const opp = await Opportunity.create({
        title: title.trim(),
        type: cleanType,
        battingRole: battingRole.trim(),
        battingStyle: battingStyle.trim(),
        ageGroup: ageGroup.trim(),
        experienceLevel: experienceLevel.trim(),
        location: location.trim(),
        summary: summary.trim(),
        fee: Number(fee) || 2000,
        status: 'published',
        createdBy: req.user._id,
        creatorName,
        creatorTeam,
        applicants: 0,
      });

      // Strip fee from creation response returned to coach
      const oppObj = opp.toObject();
      delete oppObj.fee;

      return res.status(201).json({
        success: true,
        message: 'Cricket opportunity published directly to Athlete Feed!',
        opportunity: oppObj,
      });
    } else {
      const mockOpp = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        id: `op_${Date.now()}`,
        title: title.trim(),
        type: cleanType,
        battingRole: battingRole.trim(),
        battingStyle: battingStyle.trim(),
        gender: cleanGender,
        ageGroup: ageGroup.trim(),
        experienceLevel: experienceLevel.trim(),
        location: location.trim(),
        summary: summary.trim(),
        fee: Number(fee) || 2000,
        status: 'published',
        createdBy: req.user._id ? req.user._id.toString() : 'mock_coach',
        creatorName,
        creatorTeam,
        applicants: 0,
        createdAt: new Date().toISOString(),
      };
      inMemoryOpportunities.unshift(mockOpp);

      const responseOpp = { ...mockOpp };
      delete responseOpp.fee;

      return res.status(201).json({
        success: true,
        message: 'Cricket opportunity published directly to Athlete Feed (In-Memory)!',
        opportunity: responseOpp,
      });
    }
  } catch (error) {
    console.error('createOpportunity error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create opportunity.' });
  }
};

/**
 * @desc    Delete a cricket opportunity with Server-Side Ownership Enforcement
 * @route   DELETE /api/coach/opportunities/:id
 * @access  Private (Coach only, must be owner)
 */
const deleteOpportunity = async (req, res) => {
  try {
    if (!req.user || String(req.user.role).toLowerCase() !== 'coach') {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Only Coach accounts can delete opportunities.',
      });
    }

    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid opportunity ID.' });
      }

      const opp = await Opportunity.findById(id);
      if (!opp) {
        return res.status(404).json({ success: false, message: 'Opportunity not found.' });
      }

      // Server-Side Ownership Check: Verify authenticated coach owns this opportunity
      if (opp.createdBy && opp.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Security Violation: You can only delete opportunities created by your account.',
        });
      }

      opp.status = 'deleted';
      await opp.save();
    } else {
      const idx = inMemoryOpportunities.findIndex(
        (o) => o._id === id || o.id === id
      );
      if (idx !== -1) {
        if (inMemoryOpportunities[idx].createdBy && inMemoryOpportunities[idx].createdBy !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Security Violation: You can only delete opportunities created by your account.',
          });
        }
        inMemoryOpportunities.splice(idx, 1);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully.',
    });
  } catch (error) {
    console.error('deleteOpportunity error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete opportunity.' });
  }
};

module.exports = {
  getCoachAthletes,
  getOpportunities,
  createOpportunity,
  deleteOpportunity,
};
