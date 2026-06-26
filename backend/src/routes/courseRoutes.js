const express = require("express");
const { auth, onlyRole } = require("../middleware/auth");
const { createCourse, listCourses, getCourse, updateCourse, deleteCourse, teacherStudents } = require("../controllers/courseController");

const router = express.Router();

router.get("/", listCourses);
router.get("/teacher/students", auth, onlyRole("teacher"), teacherStudents);
router.get("/:id", getCourse);
router.post("/", auth, onlyRole("teacher"), createCourse);
router.put("/:id", auth, onlyRole("teacher"), updateCourse);
router.delete("/:id", auth, onlyRole("teacher"), deleteCourse);

module.exports = router;
