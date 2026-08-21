const mongoose = require('mongoose');
const User = require('../models/User.js');

/**
 * Idempotently seed the default Admin account (admin@gmail.com / admin123)
 * read from environment variables ADMIN_EMAIL and ADMIN_PASSWORD.
 * Password is automatically hashed via User schema pre-save hook.
 */
const seedAdmin = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('[Seed] Database not connected. Skipping admin seed.');
    return;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  try {
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`✓ Idempotent Admin seeded successfully: ${adminEmail}`);
    } else {
      let updated = false;
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        updated = true;
      }
      if (updated) {
        await adminExists.save();
        console.log(`✓ Admin role updated for existing user: ${adminEmail}`);
      } else {
        console.log(`✓ Admin account already exists: ${adminEmail}`);
      }
    }
  } catch (error) {
    console.warn(`Admin Seeding Warning: ${error.message}`);
  }
};

module.exports = seedAdmin;
