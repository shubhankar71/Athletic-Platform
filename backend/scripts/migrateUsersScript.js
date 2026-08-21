const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User.js');

dotenv.config();

async function migrateUsers() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cricket_platform';
  
  try {
    console.log('Connecting to MongoDB for User Role Migration...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const users = await User.find({});
    console.log(`Found ${users.length} total users in database.`);

    let updatedCount = 0;
    for (const user of users) {
      // Check for missing or invalid roles
      if (!user.role || !['athlete', 'coach', 'admin'].includes(user.role)) {
        user.role = 'athlete'; // default fallback for legacy unassigned accounts
        await user.save();
        updatedCount++;
        console.log(`Migrated legacy user: ${user.email} -> role: 'athlete'`);
      } else {
        console.log(`Verified user: ${user.email} -> role: '${user.role}'`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} users.`);
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

migrateUsers();
