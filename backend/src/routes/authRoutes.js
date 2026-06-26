const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["student", "teacher", "admin"])
  ],
  validate,
  register
);

router.post("/login", [body("email").isEmail(), body("password").notEmpty()], validate, login);

module.exports = router;
