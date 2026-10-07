require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: "CampusConnect Backend is running",
    status: "OK"
  });
});

// Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CampusConnect Backend running on port ${PORT}`);
});
