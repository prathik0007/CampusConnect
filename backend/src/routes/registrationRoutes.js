const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventAttendees,
  updateAttendance,
} = require('../controllers/registrationController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Student event registration endpoints
router.post('/events/:id/register', authenticate, requireRole('student'), registerForEvent);
router.delete('/events/:id/register', authenticate, requireRole('student'), cancelRegistration);
router.get('/students/my-registrations', authenticate, requireRole('student'), getMyRegistrations);

// Organizer attendee management endpoints
router.get('/events/:id/attendees', authenticate, requireRole('organizer', 'admin'), getEventAttendees);
router.patch('/events/:id/attendees/:studentId', authenticate, requireRole('organizer', 'admin'), updateAttendance);

module.exports = router;
