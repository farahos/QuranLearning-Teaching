const express = require("express");
const { auth, onlyRole } = require("../middleware/auth");
const { addReview, listTeacherReviews } = require("../controllers/reviewController");

const router = express.Router();

router.get("/teacher/:teacherId", listTeacherReviews);
router.post("/", auth, onlyRole("student"), addReview);

module.exports = router;
