const express = require("express");
const { auth } = require("../middleware/auth");
const { getProgress, updateProgress } = require("../controllers/progressController");

const router = express.Router();

router.get("/:courseId", auth, getProgress);
router.put("/:courseId", auth, updateProgress);

module.exports = router;
