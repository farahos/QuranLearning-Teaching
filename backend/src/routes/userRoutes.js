const express = require("express");
const { auth, onlyRole } = require("../middleware/auth");
const {
  getMe,
  updateProfile,
  changePassword,
  updateTeacherProfile,
  addFavorite,
  removeFavorite,
  listFavorites
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", auth, getMe);
router.put("/me", auth, updateProfile);
router.put("/me/password", auth, changePassword);
router.put("/teacher/profile", auth, onlyRole("teacher"), updateTeacherProfile);
router.get("/me/favorites", auth, listFavorites);
router.post("/me/favorites/:courseId", auth, addFavorite);
router.delete("/me/favorites/:courseId", auth, removeFavorite);

module.exports = router;
