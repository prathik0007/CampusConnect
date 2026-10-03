const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const {
  authenticate,
  optionalAuthenticate,
  requireRole,
} = require('../middleware/authMiddleware');

// Public / polymorphic routes (with optional auth to detect organizer/admin roles)
router.get('/', optionalAuthenticate, getEvents);
router.get('/:id', optionalAuthenticate, getEventById);

// Protected routes (Organizer and Admin only)
router.post('/', authenticate, requireRole('organizer', 'admin'), createEvent);
router.put('/:id', authenticate, requireRole('organizer', 'admin'), updateEvent);
router.delete('/:id', authenticate, requireRole('organizer', 'admin'), deleteEvent);

module.exports = router;
