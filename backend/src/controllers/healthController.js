const mongoose = require('mongoose');

/**
 * Health check controller
 * Endpoint: GET /api/health
 * Reports API status and database connectivity
 */
const getHealth = (req, res) => {
  const readyState = mongoose.connection.readyState;

  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStatusMap[readyState] || 'unknown';
  const isDbConnected = readyState === 1;

  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    success: isDbConnected,
    message: isDbConnected
      ? 'CampusConnect API is running'
      : 'CampusConnect API is running, but database is not connected',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};

module.exports = {
  getHealth,
};
