const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendFcmNotification } = require('../config/firebase');

const createNotification = async ({ recipientId, title, message, type = 'GENERAL', eventId = null }) => {
  try {
    if (!recipientId || !title || !message) {
      return null;
    }

    const notification = await Notification.create({
      recipient: recipientId,
      title: title.trim(),
      message: message.trim(),
      body: message.trim(),
      type,
      eventId: eventId || null,
      isRead: false,
      read: false
    });

    // Attempt FCM push if user has registered a device token
    try {
      const user = await User.findById(recipientId).select('fcmToken');
      if (user && user.fcmToken) {
        await sendFcmNotification(
          user.fcmToken,
          title,
          message,
          {
            eventId: eventId ? eventId.toString() : '',
            type,
            notificationId: notification._id.toString()
          }
        );
      }
    } catch (fcmError) {
      console.warn('Notification FCM Push Error (handled safely):', fcmError.message);
    }

    return notification;
  } catch (error) {
    console.error('CreateNotification Error:', error);
    return null;
  }
};

module.exports = {
  createNotification
};
