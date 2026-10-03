const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');

// Mount routes
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);

module.exports = router;

