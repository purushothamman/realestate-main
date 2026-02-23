const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const notification = require("../controllers/notificationController");

router.get("/", protect, notification.getNotifications);
router.patch("/:id/read", protect, notification.markRead);

module.exports = router;
