const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from parent root .env and local backend .env reliably
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, './.env') });

const connectDB = require('./config/db.js');
const seedAdmin = require('./config/seedAdmin.js');
const { configureCloudinary } = require('./config/cloudinary.js');

const authRoutes = require('./routes/authRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes.js');
const analysisRoutes = require('./routes/analysisRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    configureCloudinary();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/analysis', analysisRoutes);
    app.use('/api/admin', adminRoutes);

    // Basic test route
    app.get('/', (req, res) => {
      res.send('Sports Management API & Cricket AI Pipeline running...');
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
      console.log(`Node.js Express Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Invoke start
startServer();
