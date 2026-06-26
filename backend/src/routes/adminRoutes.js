const express = require("express");
const { auth, onlyRole } = require("../middleware/auth");
const {
  dashboard,
  deleteCourse,
  deleteUser,
  listCourses,
  listTransactions,
  listUsers,
  updateUser,
} = require("../controllers/adminController");

const router = express.Router();

router.use(auth, onlyRole("admin"));

router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/courses", listCourses);
router.delete("/courses/:id", deleteCourse);
router.get("/transactions", listTransactions);

module.exports = router;
