const Course = require("../models/Course");

async function createCourse(req, res) {
  const payload = { ...req.body, teacher: req.user.id };
  if (payload.commissionRate !== undefined) {
    payload.commissionRate = Number(payload.commissionRate);
    if (![0.15, 0.2].includes(payload.commissionRate)) {
      return res.status(400).json({ message: "commissionRate must be 0.15 or 0.2" });
    }
  }
  const course = await Course.create(payload);
  return res.status(201).json(course);
}

async function listCourses(req, res) {
  const { category, search } = req.query;
  const filter = {};

  if (category) {
    filter.category = category;
  }
  if (search) {
    filter.courseName = { $regex: search, $options: "i" };
  }

  const courses = await Course.find(filter).populate("teacher", "fullName introVideoUrl whatsappNumber averageRating totalReviews telegramChannelLink profileImageUrl bio experience");
  return res.json(courses);
}

async function updateCourse(req, res) {
  const payload = { ...req.body };

  if (payload.commissionRate !== undefined) {
    payload.commissionRate = Number(payload.commissionRate);
    if (![0.15, 0.2].includes(payload.commissionRate)) {
      return res.status(400).json({ message: "commissionRate must be 0.15 or 0.2" });
    }
  }

  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, teacher: req.user.id },
    payload,
    { new: true, runValidators: true }
  ).populate("teacher", "fullName introVideoUrl whatsappNumber averageRating totalReviews telegramChannelLink profileImageUrl bio experience");

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  return res.json(course);
}

async function deleteCourse(req, res) {
  const course = await Course.findOneAndDelete({ _id: req.params.id, teacher: req.user.id });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  return res.json({ message: "Course deleted" });
}

async function teacherStudents(req, res) {
  const courses = await Course.find({ teacher: req.user.id })
    .select("courseName enrolledStudents")
    .populate("enrolledStudents.student", "fullName email profileImageUrl whatsappNumber");

  return res.json(courses);
}

async function getCourse(req, res) {
  const course = await Course.findById(req.params.id).populate("teacher", "fullName introVideoUrl whatsappNumber averageRating totalReviews telegramChannelLink profileImageUrl bio experience");
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  return res.json(course);
}

module.exports = { createCourse, listCourses, getCourse, updateCourse, deleteCourse, teacherStudents };
