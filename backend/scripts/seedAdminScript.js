const dotenv = require('dotenv');
const connectDB = require('../config/db.js');
const seedAdmin = require('../config/seedAdmin.js');
const mongoose = require('mongoose');

dotenv.config();

const runSeed = async () => {
  try {
    console.log('[Seed Command] Connecting to database...');
    await connectDB();
    await seedAdmin();
    console.log('[Seed Command] Admin seed completed.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Command] Error during admin seed:', error);
    process.exit(1);
  }
};

runSeed();
