const express = require('express');
const router = express.Router();
const { getMyRegistrations } = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

router.get('/my-registrations', protect, getMyRegistrations);

module.exports = router;
