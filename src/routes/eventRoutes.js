const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const {
  registerForEvent,
  cancelRegistration,
  getEventAttendees,
  updateAttendeeStatus,
  checkInAttendee
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Registration routes for students
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);

// Organizer attendee & QR check-in routes
router.get('/:id/attendees', protect, authorize('ORGANIZER'), getEventAttendees);
router.patch('/:id/attendees/:studentId', protect, authorize('ORGANIZER'), updateAttendeeStatus);
router.post('/:id/checkin', protect, authorize('ORGANIZER'), checkInAttendee);

// Protected Organizer event management routes
router.post('/', protect, authorize('ORGANIZER'), createEvent);
router.put('/:id', protect, authorize('ORGANIZER'), updateEvent);
router.delete('/:id', protect, authorize('ORGANIZER'), deleteEvent);

module.exports = router;
