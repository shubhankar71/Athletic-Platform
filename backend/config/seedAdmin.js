const User = require('../models/User.js');

/**
 * Automatically seed the default Admin account (nitin@gmail.com / nitin123)
 * if it doesn't already exist in the database.
 */
const seedAdmin = async () => {
  try {
    const adminEmail = 'nitin@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'Nitin (Admin)',
        email: adminEmail,
        password: 'nitin123',
        role: 'admin',
      });
      console.log('✓ Admin account seeded successfully: nitin@gmail.com / nitin123');
    } else {
      // Ensure role is admin if account exists
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        await adminExists.save();
      }
    }
  } catch (error) {
    console.error(`Admin Seeding Warning: ${error.message}`);
  }
};

module.exports = seedAdmin;
