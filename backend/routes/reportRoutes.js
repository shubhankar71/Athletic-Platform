const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getUnresolvedCount,
  getReportById,
  updateReport,
} = require('../controllers/reportController.js');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware.js');

// Athlete & Coach route to submit a report
router.post('/', authenticateUser, createReport);

// Admin-only management routes
router.get('/admin/all', requireAdmin, getReports);
router.get('/admin/unresolved-count', requireAdmin, getUnresolvedCount);
router.get('/admin/:id', requireAdmin, getReportById);
router.patch('/admin/:id', requireAdmin, updateReport);

module.exports = router;
