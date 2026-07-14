const express = require("express");
const { auth } = require("../middleware/auth");
const { listNotifications, markRead, markAllRead, removeNotification } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", auth, listNotifications);
router.patch("/read-all", auth, markAllRead);
router.patch("/:id/read", auth, markRead);
router.delete("/:id", auth, removeNotification);

module.exports = router;
