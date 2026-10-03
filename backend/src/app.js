const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CampusConnect Backend API',
    healthCheck: '/api/health',
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server if executed directly
if (require.main === module) {
  const server = app.listen(config.PORT, () => {
    console.log(`[CampusConnect API] Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    console.log(`[CampusConnect API] Health check endpoint: http://localhost:${config.PORT}/api/health`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n[CampusConnect API] Shutting down server...');
    server.close(() => {
      console.log('[CampusConnect API] Server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = app;
