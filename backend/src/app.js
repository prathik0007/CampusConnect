const express = require('express');
const cors = require('cors');
const config = require('./config');
const { connectDB, disconnectDB } = require('./config/database');
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

// Central Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start Express server after MongoDB connection is established
 */
const startServer = async () => {
  try {
    console.log('[CampusConnect API] Initializing database connection...');
    await connectDB();

    const server = app.listen(config.PORT, () => {
      console.log(`[CampusConnect API] Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
      console.log(`[CampusConnect API] Health check endpoint: http://localhost:${config.PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[CampusConnect API] Gracefully shutting down...');
      server.close(async () => {
        console.log('[CampusConnect API] HTTP server closed.');
        try {
          await disconnectDB();
        } catch (dbErr) {
          console.error('[CampusConnect API] Error closing DB connection:', dbErr.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[CampusConnect API] Server failed to start due to database connection error.');
    console.error(`[CampusConnect API] Details: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
