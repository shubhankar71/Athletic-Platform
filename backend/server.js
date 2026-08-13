const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const seedAdmin = require('./config/seedAdmin.js');
const authRoutes = require('./routes/authRoutes.js');

dotenv.config();

const app = express();

// Start server after DB connection and seeding default admin
const startServer = async () => {
  try {
    await connectDB();
    // Seed the one-off admin account if missing
    await seedAdmin();

    // Middleware
    app.use(cors());
    app.use(express.json());

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

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Invoke start
startServer();

// Middleware
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
