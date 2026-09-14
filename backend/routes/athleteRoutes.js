const express = require('express');
const router = express.Router();
const {
  applyToOpportunity,
  getAthleteApplications,
} = require('../controllers/athleteController.js');
const { authenticateUser, requireAthlete } = require('../middleware/authMiddleware.js');

// Apply to opportunity (Athlete only)
router.post('/apply', requireAthlete, applyToOpportunity);

// Get athlete application history (Athlete only)
router.get('/applications', requireAthlete, getAthleteApplications);

module.exports = router;
