const express = require("express");
const { auth } = require("../middleware/auth");
const { walletDashboard, payCourse } = require("../controllers/walletController");

const router = express.Router();

router.get("/", auth, walletDashboard);
router.post("/pay-course", auth, payCourse);

module.exports = router;
