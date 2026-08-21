const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Public Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected Route - Get Current Authenticated User Profile
router.get('/me', protect, getMe);

module.exports = router;
