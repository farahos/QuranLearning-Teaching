const express = require("express");
const { auth, onlyRole } = require("../middleware/auth");
const { submitKyc, verifyKycForDemo } = require("../controllers/kycController");

const router = express.Router();

router.post("/submit", auth, onlyRole("teacher"), submitKyc);
router.patch("/verify/:teacherId", verifyKycForDemo);

module.exports = router;
