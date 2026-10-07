const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

const registerToken = async (req, res) => {
  try {
    const { token, deviceToken } = req.body;
    const fcmToken = token || deviceToken;

    if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.trim().length === 0) {
      return res.status(400).json({
        message: 'Please provide a valid FCM device token.',
        status: 'ERROR'
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      fcmToken: fcmToken.trim()
    });

    return res.status(200).json({
      message: 'FCM device token registered successfully',
      status: 'OK'
    });
  } catch (error) {
    console.error('RegisterToken Error:', error);
    return res.status(500).json({
      message: 'Server error registering FCM device token.',
      status: 'ERROR'
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('GetNotifications Error:', error);
    return res.status(500).json({
      message: 'Server error retrieving notifications.',
      status: 'ERROR'
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid notification ID format.',
        status: 'ERROR'
      });
    }

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found.',
        status: 'ERROR'
      });
    }

    notification.isRead = true;
    notification.read = true;
    await notification.save();

    return res.status(200).json(notification);
  } catch (error) {
    console.error('MarkNotificationAsRead Error:', error);
    return res.status(500).json({
      message: 'Server error marking notification as read.',
      status: 'ERROR'
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, read: true }
    );

    return res.status(200).json({
      message: 'All notifications marked as read',
      status: 'OK'
    });
  } catch (error) {
    console.error('MarkAllNotificationsAsRead Error:', error);
    return res.status(500).json({
      message: 'Server error marking all notifications as read.',
      status: 'ERROR'
    });
  }
};

module.exports = {
  registerToken,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
