const Notification = require("../models/Notification");

async function listNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100);
  return res.json(notifications);
}

async function markRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  return res.json(notification);
}

async function markAllRead(req, res) {
  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
  return res.json({ message: "All notifications marked as read" });
}

async function removeNotification(req, res) {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  return res.json({ message: "Notification deleted" });
}

module.exports = { listNotifications, markRead, markAllRead, removeNotification };
