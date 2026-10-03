const { Notification, User } = require('../models');

/**
 * Send an Expo Push Notification to an Exponent push token.
 * Uses Expo Push HTTP/2 REST API directly without heavy external dependencies.
 */
async function sendExpoPushMessage(pushToken, { title, body, data = {} }) {
  if (!pushToken || typeof pushToken !== 'string' || !pushToken.startsWith('ExponentPushToken[')) {
    return { success: false, reason: 'Invalid or missing Expo push token format' };
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
      }),
    });

    const result = await response.json();
    return { success: response.ok, result };
  } catch (error) {
    // Fail gracefully without crashing callers or breaking business flows
    return { success: false, error: error.message };
  }
}

/**
 * Create a persistent notification record in MongoDB and attempt push delivery if recipient has a token.
 * Notification failure MUST NEVER break the underlying business operation.
 */
async function createNotification({ recipientId, eventId = null, title, message, type = 'general', data = {} }) {
  try {
    const notification = await Notification.create({
      recipientId,
      eventId,
      title,
      message,
      type,
      isRead: false,
    });

    // Lookup user's push token safely (pushToken has select: false by default in User model)
    const recipient = await User.findById(recipientId).select('+pushToken');
    if (recipient && recipient.pushToken) {
      // Asynchronously send push message without blocking response
      sendExpoPushMessage(recipient.pushToken, {
        title,
        body: message,
        data: {
          ...data,
          notificationId: notification._id.toString(),
          eventId: eventId ? eventId.toString() : null,
          type,
        },
      }).catch((pushErr) => {
        // Safe developer log without exposing push token
        console.warn('[Push Service] Delivery notification failed:', pushErr.message);
      });
    }

    return notification;
  } catch (err) {
    console.warn('[Notification Service] Notification creation error:', err.message);
    return null;
  }
}

/**
 * Send notification to multiple users (e.g. registered event attendees)
 */
async function sendNotificationToUsers(recipientIds, { eventId = null, title, message, type = 'general', data = {} }) {
  if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
    return [];
  }

  // Deduplicate recipient IDs
  const uniqueIds = [...new Set(recipientIds.map((id) => id.toString()))];

  const results = [];
  for (const id of uniqueIds) {
    try {
      const notif = await createNotification({
        recipientId: id,
        eventId,
        title,
        message,
        type,
        data,
      });
      if (notif) results.push(notif);
    } catch (_) {
      // Continue processing remaining recipients
    }
  }

  return results;
}

module.exports = {
  sendExpoPushMessage,
  createNotification,
  sendNotificationToUsers,
};
