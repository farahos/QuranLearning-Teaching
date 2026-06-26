const express = require("express");
const { auth, onlyRole } = require("../middleware/auth");
const { getMe, updateProfile, changePassword, updateTeacherProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/me", auth, getMe);
router.put("/me", auth, updateProfile);
router.put("/me/password", auth, changePassword);
router.put("/teacher/profile", auth, onlyRole("teacher"), updateTeacherProfile);

module.exports = router;
