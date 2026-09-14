const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  banUser,
  unbanUser,
  deleteUser,
} = require('../controllers/adminController.js');
const { requireAdmin } = require('../middleware/authMiddleware.js');

// All admin routes strictly protected by requireAdmin middleware
router.get('/stats', requireAdmin, getAdminStats);
router.get('/users', requireAdmin, getUsers);

// Ban User (supporting PATCH, POST, and PUT HTTP methods for maximum API client compatibility)
router.patch('/users/:id/ban', requireAdmin, banUser);
router.post('/users/:id/ban', requireAdmin, banUser);
router.put('/users/:id/ban', requireAdmin, banUser);

// Unban User (supporting PATCH, POST, and PUT HTTP methods)
router.patch('/users/:id/unban', requireAdmin, unbanUser);
router.post('/users/:id/unban', requireAdmin, unbanUser);
router.put('/users/:id/unban', requireAdmin, unbanUser);

// Delete User
router.delete('/users/:id', requireAdmin, deleteUser);

module.exports = router;

