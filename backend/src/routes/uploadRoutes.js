const express = require('express');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadEventBanner } = require('../controllers/uploadController');

const router = express.Router();

/**
 * @route   POST /api/uploads/event-banner
 * @desc    Upload event banner image to Cloudinary (under campusconnect/events)
 * @access  Protected (organizer, admin)
 */
router.post(
  '/event-banner',
  authenticate,
  requireRole('organizer', 'admin'),
  upload.single('image'),
  uploadEventBanner
);

module.exports = router;
