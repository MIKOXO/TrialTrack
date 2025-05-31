import asyncHandler from "express-async-handler";
import Notification from "../models/notificationModel.js";

// @desc    Send Notification
// @route   POST api/notifications/send
// @access  Private
const sendNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type } = req.body;

  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type: type || "general",
    });
    await notification.save();

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get Notifications
// @route   GET api/notifications/getNotifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const notifications = await Notification.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Mark Notifications as read
// @route   PUT api/notifications/read/:id
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);

    if (!notification)
      return res.status(404).json({ error: "Notification not found" });
    if (notification.user.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { sendNotification, getMyNotifications, markAsRead };
