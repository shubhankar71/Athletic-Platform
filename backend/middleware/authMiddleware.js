const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User.js');
const { inMemoryUsers } = require('../controllers/authController.js');

/**
 * Reusable middleware to authenticate JWT tokens.
 */
const authenticateUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_key'
    );


    if (mongoose.connection.readyState === 1) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      // Fallback in-memory user lookup by decoded ID or email or payload info
      let foundUser = null;
      for (const u of inMemoryUsers.values()) {
        if (u._id === decoded.id) {
          foundUser = u;
          break;
        }
      }
      if (!foundUser) {
        // Construct user object from decoded JWT payload
        foundUser = {
          _id: decoded.id,
          name: decoded.name || 'Authenticated User',
          email: decoded.email || 'user@example.com',
          role: decoded.role || 'athlete',
        };
      }
      req.user = foundUser;
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User no longer exists.',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Invalid or expired token.',
    });
  }
};

/**
 * Middleware: Strictly requires authenticated user AND user.role === "athlete".
 * - If unauthenticated -> 401 "Authentication required."
 * - If authenticated but role != athlete -> 403 "Video analysis is available only to athletes."
 */
const requireAthlete = async (req, res, next) => {
  await authenticateUser(req, res, () => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (req.user.role !== 'athlete') {
      return res.status(403).json({
        success: false,
        message: 'Video analysis is available only to athletes.',
      });
    }

    next();
  });
};

/**
 * Middleware: Strictly requires authenticated user AND user.role === "admin".
 */
const requireAdmin = async (req, res, next) => {
  await authenticateUser(req, res, () => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required.',
      });
    }

    next();
  });
};

const protect = authenticateUser;
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  requireAthlete,
  requireAdmin,
  protect,
  authorize,
};
