const mongoose = require('mongoose');

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('[DB Warning] MONGO_URI/MONGODB_URI not specified in .env. Running API with in-memory fallback.');
    return;
  }

  mongoUri = mongoUri.trim();

  // Safely auto-encode special characters in username or password if unescaped
  if (mongoUri.includes('@')) {
    const match = mongoUri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const scheme = match[1];
      const user = encodeURIComponent(decodeURIComponent(match[2]));
      const pass = encodeURIComponent(decodeURIComponent(match[3]));
      const hostAndParams = match[4];
      mongoUri = `${scheme}${user}:${pass}@${hostAndParams}`;
    }
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      dbName: 'athletic_platform',
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.warn(`[DB Warning] MongoDB Connection Error: ${error.message}. Running API with in-memory fallback.`);
  }
};

module.exports = connectDB;
