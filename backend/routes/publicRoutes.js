const express = require('express');
const router = express.Router();
const {
  getCricketNews,
  getCricketLiveScores,
  getPublicOpportunities,
} = require('../controllers/publicController');

// Public Cricket News
router.get('/cricket/news', getCricketNews);

// Public Live Cricket Scores
router.get('/cricket/live', getCricketLiveScores);

// Public Cricket Opportunities Feed
router.get('/opportunities', getPublicOpportunities);

module.exports = router;
