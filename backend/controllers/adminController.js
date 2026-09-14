const mongoose = require('mongoose');
const User = require('../models/User.js');
const Analysis = require('../models/Analysis.js');
const { inMemoryUsers } = require('./authController.js');

/**
 * Get overall administrative statistics directly from MongoDB database
 * @route GET /api/admin/stats
 * @access Private (Admin only)
 */
const getAdminStats = async (req, res) => {
  try {
    let totalUsers = 0;
    let totalAthletes = 0;
    let totalCoaches = 0;
    let totalAdmins = 0;
    let totalAnalyses = 0;
    let completedAnalyses = 0;
    let processingAnalyses = 0;
    let failedAnalyses = 0;
    let recentAnalyses = [];
    let analysisByUser = [];

    if (mongoose.connection.readyState === 1) {
      // 1. Real MongoDB user counts (excluding deleted users) with case-insensitive role matching
      const activeFilter = { isDeleted: { $ne: true } };
      totalUsers = await User.countDocuments(activeFilter);
      totalAthletes = await User.countDocuments({ ...activeFilter, role: { $regex: /^athlete$/i } });
      totalCoaches = await User.countDocuments({ ...activeFilter, role: { $regex: /^coach$/i } });
      totalAdmins = await User.countDocuments({ ...activeFilter, role: { $regex: /^admin$/i } });

      // 2. Real MongoDB analysis counts by status
      totalAnalyses = await Analysis.countDocuments();
      completedAnalyses = await Analysis.countDocuments({ status: 'completed' });
      processingAnalyses = await Analysis.countDocuments({ status: { $in: ['processing', 'pending'] } });
      failedAnalyses = await Analysis.countDocuments({ status: 'failed' });

      // 3. Recent Analysis Activity with populated athlete name & email
      recentAnalyses = await Analysis.find()
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      // 4. Analysis Counts by User (Aggregation)
      analysisByUser = await Analysis.aggregate([
        { $match: { user: { $ne: null } } },
        {
          $group: {
            _id: '$user',
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            processing: { $sum: { $cond: [{ $in: ['$status', ['processing', 'pending']] }, 1, 0] } },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'athlete',
          },
        },
        { $unwind: { path: '$athlete', preserveNullAndEmptyArrays: false } },
        {
          $project: {
            _id: 1,
            name: '$athlete.name',
            email: '$athlete.email',
            role: '$athlete.role',
            total: 1,
            completed: 1,
            failed: 1,
            processing: 1,
          },
        },
        { $sort: { total: -1 } },
        { $limit: 15 },
      ]);
    } else {
      // In-memory fallback calculations
      const activeUsers = Array.from(inMemoryUsers.values()).filter((u) => !u.isDeleted);
      totalUsers = activeUsers.length;
      totalAthletes = activeUsers.filter((u) => String(u.role).toLowerCase() === 'athlete').length;
      totalCoaches = activeUsers.filter((u) => String(u.role).toLowerCase() === 'coach').length;
      totalAdmins = activeUsers.filter((u) => String(u.role).toLowerCase() === 'admin').length;
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAthletes,
        totalCoaches,
        totalAdmins,
        totalAnalyses,
        completedAnalyses,
        processingAnalyses,
        failedAnalyses,
      },
      recentAnalyses,
      analysisByUser,
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
 * Get list of searchable athletes and coaches
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
const getUsers = async (req, res) => {
  try {
    const { search = '', role = 'all' } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = { isDeleted: { $ne: true } };

      // Role filter with case-insensitive regex
      if (role === 'athlete' || role === 'coach') {
        filter.role = { $regex: new RegExp(`^${role}$`, 'i') };
      } else {
        // Exclude admin users from search/manage list by default
        filter.role = { $in: [/^athlete$/i, /^coach$/i] };
      }

      // Search filter (name or email, case-insensitive, partial matching)
      if (search && search.trim() !== '') {
        const cleanSearch = search.trim();
        const escapedSearch = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSearch, 'i');
        filter.$or = [{ name: regex }, { email: regex }];
      }

      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();

      // Check temporary ban auto-expirations in output
      const now = new Date();
      const updatedUsers = users.map((u) => {
        if (u.isBanned && u.banType === 'temporary' && u.banUntil && new Date(u.banUntil) <= now) {
          u.isBanned = false;
          u.banType = null;
          u.banUntil = null;
          u.banReason = '';
        }
        return u;
      });

      return res.status(200).json({ success: true, users: updatedUsers });
    } else {
      let list = Array.from(inMemoryUsers.values()).filter((u) => !u.isDeleted);
      if (role === 'athlete' || role === 'coach') {
        list = list.filter((u) => String(u.role).toLowerCase() === role);
      } else {
        list = list.filter((u) => ['athlete', 'coach'].includes(String(u.role).toLowerCase()));
      }
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (u) => (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q))
        );
      }
      return res.status(200).json({ success: true, users: list });
    }
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users list.' });
  }
};

/**
 * Ban user (temporary or permanent)
 * @route PATCH /api/admin/users/:id/ban
 * @access Private (Admin only)
 */
const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { banType = 'temporary', durationDays, customDate, reason = '' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(id);
      if (!user || user.isDeleted) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Security checks: Cannot ban admins or self
      if (String(user.role).toLowerCase() === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Security Violation: Admin accounts cannot be banned.',
        });
      }

      if (req.user && req.user._id && req.user._id.toString() === user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Security Violation: You cannot ban your own account.',
        });
      }

      user.isBanned = true;
      user.banType = banType === 'permanent' ? 'permanent' : 'temporary';
      user.banReason = reason.trim();

      if (user.banType === 'temporary') {
        let until = new Date();
        if (customDate) {
          until = new Date(customDate);
        } else if (durationDays) {
          until.setDate(until.getDate() + Number(durationDays));
        } else {
          until.setDate(until.getDate() + 7);
        }
        user.banUntil = until;
      } else {
        user.banUntil = null;
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: `User ${user.name} has been ${user.banType === 'permanent' ? 'permanently' : 'temporarily'} banned.`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBanned: user.isBanned,
          banType: user.banType,
          banUntil: user.banUntil,
          banReason: user.banReason,
        },
      });
    } else {
      let targetUser = null;
      for (const u of inMemoryUsers.values()) {
        if (u._id === id) {
          targetUser = u;
          break;
        }
      }
      if (!targetUser || targetUser.isDeleted) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      if (String(targetUser.role).toLowerCase() === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Security Violation: Admin accounts cannot be banned.',
        });
      }
      targetUser.isBanned = true;
      targetUser.banType = banType === 'permanent' ? 'permanent' : 'temporary';
      targetUser.banReason = reason.trim();
      if (targetUser.banType === 'temporary') {
        let until = new Date();
        until.setDate(until.getDate() + (Number(durationDays) || 7));
        targetUser.banUntil = until;
      } else {
        targetUser.banUntil = null;
      }
      return res.status(200).json({
        success: true,
        message: `User ${targetUser.name} has been banned.`,
        user: targetUser,
      });
    }
  } catch (error) {
    console.error('banUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to ban user.' });
  }
};

/**
 * Unban user
 * @route PATCH /api/admin/users/:id/unban
 * @access Private (Admin only)
 */
const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(id);
      if (!user || user.isDeleted) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      user.isBanned = false;
      user.banType = null;
      user.banUntil = null;
      user.banReason = '';

      await user.save();

      return res.status(200).json({
        success: true,
        message: `User ${user.name} has been unbanned. Access restored.`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBanned: user.isBanned,
          banType: user.banType,
          banUntil: user.banUntil,
          banReason: user.banReason,
        },
      });
    } else {
      let targetUser = null;
      for (const u of inMemoryUsers.values()) {
        if (u._id === id) {
          targetUser = u;
          break;
        }
      }
      if (!targetUser || targetUser.isDeleted) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      targetUser.isBanned = false;
      targetUser.banType = null;
      targetUser.banUntil = null;
      targetUser.banReason = '';
      return res.status(200).json({
        success: true,
        message: `User ${targetUser.name} unbanned.`,
        user: targetUser,
      });
    }
  } catch (error) {
    console.error('unbanUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to unban user.' });
  }
};

/**
 * Delete user (Soft deletion to preserve historical ML analysis & audit stats)
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Security check: Cannot delete admin accounts or self
      if (String(user.role).toLowerCase() === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Security Violation: Admin accounts cannot be deleted.',
        });
      }

      if (req.user && req.user._id && req.user._id.toString() === user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Security Violation: You cannot delete your own account.',
        });
      }

      user.isDeleted = true;
      await user.save();

      return res.status(200).json({
        success: true,
        message: `User ${user.name} (${user.email}) has been deleted successfully.`,
      });
    } else {
      let targetUser = null;
      for (const u of inMemoryUsers.values()) {
        if (u._id === id) {
          targetUser = u;
          break;
        }
      }
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      if (String(targetUser.role).toLowerCase() === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Security Violation: Admin accounts cannot be deleted.',
        });
      }
      targetUser.isDeleted = true;
      return res.status(200).json({
        success: true,
        message: `User ${targetUser.name} deleted.`,
      });
    }
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  getAllUsers: getUsers,
  banUser,
  unbanUser,
  deleteUser,
};

