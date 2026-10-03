const mongoose = require('mongoose');
const config = require('./index');

/**
 * Connect to MongoDB database via Mongoose
 * Reads MONGODB_URI from configuration/environment
 */
const connectDB = async () => {
  const mongoURI = config.MONGODB_URI || process.env.MONGODB_URI;

  if (!mongoURI) {
    const errorMsg = '[MongoDB] Error: MONGODB_URI is not defined in environment variables. Please check your backend/.env file.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging 30s
    });

    console.log(`[MongoDB] Successfully connected to database: "${conn.connection.name}" at host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // Log error message safely without exposing credentials/full URI
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }
};

/**
 * Check if MongoDB connection is active
 * @returns {boolean} true if connected (readyState === 1)
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Disconnect cleanly from MongoDB
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[MongoDB] Disconnected cleanly from database.');
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Warning: Database connection lost.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Database reconnected.');
});

module.exports = {
  connectDB,
  isConnected,
  disconnectDB,
};
