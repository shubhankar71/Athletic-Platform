const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

// Public Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Route - Get Current Authenticated User Profile
router.get('/me', protect, getMe);

// Role-Restricted Demonstration Routes
router.get('/athlete-only', protect, authorize('athlete'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Athlete! You have accessed an athlete-only resource.',
    user: req.user,
  });
});

router.get('/coach-only', protect, authorize('coach'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Coach! You have accessed a coach-only resource.',
    user: req.user,
  });
});

router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin! You have accessed an admin-only resource.',
    user: req.user,
  });
});

module.exports = router;
