const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

/**
 * Generate JWT Token containing userId and role
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

/**
 * Helper to get default dashboard route based on role
 */
const getDashboardRoute = (role) => {
  switch (role) {
    case 'coach':
      return '/dashboard/coach';
    case 'admin':
      return '/dashboard/admin';
    case 'athlete':
    default:
      return '/dashboard/athlete';
  }
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation: Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Validate role if provided. Admins cannot be created via registration.
    if (role && !['athlete', 'coach'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Registration supports only athlete or coach roles',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user (admin role is not allowed via public registration)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'athlete',
    });

    if (user) {
      const token = generateToken(user._id, user.role);
      const redirectUrl = getDashboardRoute(user.role);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        redirectUrl,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data received',
      });
    }
  } catch (error) {
    console.error(`Register Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server Error during registration',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation: Check email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);
    const redirectUrl = getDashboardRoute(user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      redirectUrl,
    });
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server Error during login',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
      redirectUrl: getDashboardRoute(user.role),
    });
  } catch (error) {
    console.error(`GetMe Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server Error retrieving profile',
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getDashboardRoute,
};
