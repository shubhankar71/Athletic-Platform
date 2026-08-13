const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const seedAdmin = require('./config/seedAdmin.js');
const authRoutes = require('./routes/authRoutes.js');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Ensure the DB is connected (and the admin seeded) before handling any
// request. connectDB() and this seed flag are both cached across
// invocations, so on a warm serverless instance this is a no-op — but on a
// traditional server it also just runs once, right after startup.
let seeded = false;
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!seeded) {
      seeded = true;
      await seedAdmin();
    }
    next();
  } catch (error) {
    res.status(503).json({ success: false, message: 'Database unavailable' });
  }
});

// Routes
app.use('/api/auth', authRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.send('Sports Management API is running...');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found - ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
