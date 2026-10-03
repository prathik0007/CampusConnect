const mongoose = require('mongoose');
const { Notification, User } = require('../models');

/**
 * Register or update an Expo Push Token for the authenticated user
 * POST /api/notifications/register-token
 * Protection: authenticate
 */
const registerPushToken = async (req, res, next) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken || typeof pushToken !== 'string' || pushToken.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Push token is required and must be a non-empty string.',
      });
    }

    // Save token to authenticated user's record
    await User.findByIdAndUpdate(req.user._id, {
      pushToken: pushToken.trim(),
    });

    return res.status(200).json({
      success: true,
      message: 'Push notification token registered',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification list for authenticated user
 * GET /api/notifications
 * Protection: authenticate
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const unreadOnly = req.query.unreadOnly === 'true';

    const filter = { recipientId: userId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipientId: userId, isRead: false }),
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const formatted = notifications.map((n) => ({
      id: n._id.toString(),
      recipientId: n.recipientId.toString(),
      eventId: n.eventId ? n.eventId.toString() : null,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        notifications: formatted,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 * Protection: authenticate
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format',
      });
    }

    const notification = await Notification.findOne({
      _id: id,
      recipientId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied',
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification: notification.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications for authenticated user as read
 * PATCH /api/notifications/read-all
 * Protection: authenticate
 */
const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      {
        recipientId: req.user._id,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        updatedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPushToken,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
