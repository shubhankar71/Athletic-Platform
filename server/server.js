const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const athleteRoutes = require('./routes/athleteRoutes');
const coachRoutes = require('./routes/coachRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/athletes', athleteRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
