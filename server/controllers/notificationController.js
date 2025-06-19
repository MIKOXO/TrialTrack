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

// @desc    Delete a notification
// @route   DELETE /api/notifications/delete/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the notification and verify ownership
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Check if the user owns this notification
    if (notification.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this notification" });
    }

    // Delete the notification
    await Notification.findByIdAndDelete(id);

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// @desc    Bulk delete notifications
// @route   POST /api/notifications/bulk-delete
// @access  Private
const bulkDeleteNotifications = asyncHandler(async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "Please provide notification IDs to delete" });
    }

    // Find notifications and verify ownership
    const notifications = await Notification.find({
      _id: { $in: ids },
      user: userId,
    });

    if (notifications.length !== ids.length) {
      return res
        .status(403)
        .json({ error: "Some notifications not found or not authorized" });
    }

    // Delete the notifications
    const result = await Notification.deleteMany({
      _id: { $in: ids },
      user: userId,
    });

    res.json({
      message: `${result.deletedCount} notification${
        result.deletedCount !== 1 ? "s" : ""
      } deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error bulk deleting notifications:", err);
    res.status(500).json({ error: "Failed to delete notifications" });
  }
});

export {
  sendNotification,
  getMyNotifications,
  markAsRead,
  deleteNotification,
  bulkDeleteNotifications,
};
