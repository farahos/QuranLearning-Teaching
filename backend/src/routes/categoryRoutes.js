const express = require("express");
const { auth } = require("../middleware/auth");
const { createCategory, deleteCategory, listCategories, updateCategory } = require("../controllers/categoryController");

const router = express.Router();

function teacherOrAdmin(req, res, next) {
  if (!["teacher", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
}

router.get("/", listCategories);
router.post("/", auth, teacherOrAdmin, createCategory);
router.put("/:id", auth, teacherOrAdmin, updateCategory);
router.delete("/:id", auth, teacherOrAdmin, deleteCategory);

module.exports = router;
