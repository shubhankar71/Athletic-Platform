const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const Athlete = require('./models/Athlete');
const Opportunity = require('./models/Opportunity');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Athlete Endpoints
app.get('/api/athletes', async (req, res) => {
  try {
    const athletes = await Athlete.find();
    res.json(athletes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/athletes', async (req, res) => {
  try {
    const athlete = await Athlete.create(req.body);
    res.status(201).json(athlete);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Opportunity Endpoints
app.get('/api/opportunities', async (req, res) => {
  try {
    const opportunities = await Opportunity.find();
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/opportunities', async (req, res) => {
  try {
    const opportunity = await Opportunity.create(req.body);
    res.status(201).json(opportunity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
