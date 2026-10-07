const express = require('express');
const router = express.Router();
const {
  registerToken,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.post('/register-token', protect, registerToken);
router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllNotificationsAsRead);
router.patch('/:id/read', protect, markNotificationAsRead);

module.exports = router;
