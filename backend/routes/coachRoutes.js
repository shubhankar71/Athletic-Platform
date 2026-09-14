const express = require('express');
const router = express.Router();
const {
  getCoachAthletes,
  getOpportunities,
  createOpportunity,
  deleteOpportunity,
} = require('../controllers/coachController.js');
const { authenticateUser, requireCoach } = require('../middleware/authMiddleware.js');

// Roster API (Protected for authenticated users)
router.get('/athletes', authenticateUser, getCoachAthletes);

// Opportunities APIs
router.get('/opportunities', getOpportunities);
router.post('/opportunities', requireCoach, createOpportunity);
router.delete('/opportunities/:id', requireCoach, deleteOpportunity);

module.exports = router;
