const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const {
  registerPushToken,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notificationController');

const router = express.Router();

// All notification routes are protected
router.use(authenticate);

/**
 * @route   POST /api/notifications/register-token
 * @desc    Register or update user push notification token
 * @access  Protected
 */
router.post('/register-token', registerPushToken);

/**
 * @route   GET /api/notifications
 * @desc    Retrieve user's notifications (supports ?unreadOnly=true, ?page=1, ?limit=20)
 * @access  Protected
 */
router.get('/', getNotifications);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all unread notifications as read
 * @access  Protected
 */
router.patch('/read-all', markAllNotificationsRead);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Protected
 */
router.patch('/:id/read', markNotificationRead);

module.exports = router;
