const express = require("express");
const { body } = require("express-validator");
const { auth, onlyRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { addReview, listTeacherReviews } = require("../controllers/reviewController");

const router = express.Router();

router.get("/teacher/:teacherId", listTeacherReviews);
router.post(
  "/",
  auth,
  onlyRole("student"),
  [
    body("course").notEmpty(),
    body("teacher").notEmpty(),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").optional().isString().isLength({ max: 1000 })
  ],
  validate,
  addReview
);

module.exports = router;
