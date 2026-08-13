const mongoose = require('mongoose');

// Serverless-safe connection caching: Vercel functions can be reused between
// invocations, so we cache the connection promise instead of reconnecting
// (and instead of calling process.exit, which would kill the whole function).
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      });
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
  return cached.conn;
};

module.exports = connectDB;
