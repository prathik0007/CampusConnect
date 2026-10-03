/**
 * Health check controller
 * Endpoint: GET /api/health
 */
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusConnect API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};

module.exports = {
  getHealth,
};
