const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const registrationRoutes = require('./registrationRoutes');

// Mount routes
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/', registrationRoutes);

module.exports = router;


