const mongoose = require('mongoose');
const User = require('../models/User.js');
const Opportunity = require('../models/Opportunity.js');

/**
 * Idempotently seed default Admin and initial published Cricket Opportunities.
 */
const seedAdmin = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('[Seed] Database not connected. Skipping seed.');
    return;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  try {
    // 1. Seed Admin
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`✓ Idempotent Admin seeded successfully: ${adminEmail}`);
    }

    // 2. Ensure at least one Coach exists for seeding
    let coachUser = await User.findOne({ role: 'coach' });
    if (!coachUser) {
      coachUser = await User.create({
        name: 'Coach Anupam',
        email: 'coach.anupam@cricket.org',
        password: 'password123',
        role: 'coach',
        team: 'Delhi Cricket Academy',
      });
      console.log(`✓ Default Coach seeded successfully: ${coachUser.email}`);
    }

    // 3. Seed Initial Published Opportunities if zero non-deleted opportunities exist
    const activeOppCount = await Opportunity.countDocuments({ status: { $ne: 'deleted' } });
    if (activeOppCount === 0) {
      await Opportunity.create([
        {
          title: 'U19 Opening Batter Selection Trial',
          type: 'trial',
          battingRole: 'Opening Batter',
          battingStyle: 'Right-Handed',
          gender: 'Male',
          ageGroup: 'U19',
          experienceLevel: 'Advanced',
          location: 'Delhi Cricket Academy Ground 1',
          summary: 'State level selection trial for technically strong opening batters capable of handling new ball pace and swing.',
          fee: 2500,
          status: 'published',
          createdBy: coachUser._id,
          creatorName: coachUser.name,
          creatorTeam: coachUser.team || 'Delhi Cricket Academy',
          applicants: 0,
        },
        {
          title: 'Women Wicketkeeper-Batter Recruitment',
          type: 'recruitment',
          battingRole: 'Wicketkeeper-Batter',
          battingStyle: 'Either',
          gender: 'Female',
          ageGroup: 'Senior',
          experienceLevel: 'Professional',
          location: 'Mumbai Cricket Club Indoor Facility',
          summary: 'Recruiting female wicketkeeper-batters for upcoming T20 championship season. Excellent glovework and finishing skills required.',
          fee: 2000,
          status: 'published',
          createdBy: coachUser._id,
          creatorName: 'Coach Vikram',
          creatorTeam: 'Mumbai Cricket Club',
          applicants: 0,
        },
        {
          title: 'Middle-Order Batter Power-Hitting Trial',
          type: 'trial',
          battingRole: 'Middle-Order Batter',
          battingStyle: 'Left-Handed',
          gender: 'Any',
          ageGroup: 'U23',
          experienceLevel: 'Advanced',
          location: 'Bangalore National Cricket Stadium',
          summary: 'Open trial for middle-order power hitters with proven strike rate against spin and seam in death overs.',
          fee: 1500,
          status: 'published',
          createdBy: coachUser._id,
          creatorName: coachUser.name,
          creatorTeam: coachUser.team || 'Delhi Cricket Academy',
          applicants: 0,
        },
      ]);
      console.log('✓ Initial Coach Opportunities seeded successfully for Athlete Feed!');
    }
  } catch (error) {
    console.error('Seeding Error:', error.message);
  }
};

module.exports = seedAdmin;
