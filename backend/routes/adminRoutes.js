const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers } = require('../controllers/adminController.js');
const { requireAdmin } = require('../middleware/authMiddleware.js');

// All admin routes strictly protected by requireAdmin middleware
router.get('/stats', requireAdmin, getAdminStats);
router.get('/users', requireAdmin, getAllUsers);

module.exports = router;
