const Review = require("../models/Review");
const User = require("../models/User");
const Course = require("../models/Course");
const Notification = require("../models/Notification");

async function refreshTeacherRating(teacherId) {
  const rows = await Review.aggregate([
    { $match: { teacher: teacherId } },
    { $group: { _id: "$teacher", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  const stats = rows[0] || { avg: 0, count: 0 };
  await User.findByIdAndUpdate(teacherId, {
    averageRating: Number(stats.avg.toFixed(1)),
    totalReviews: stats.count
  });
}

async function addReview(req, res) {
  const { course, teacher, rating, comment } = req.body;

  const courseDoc = await Course.findById(course);
  if (!courseDoc) {
    return res.status(404).json({ message: "Course not found" });
  }
  const isEnrolled = courseDoc.enrolledStudents.some((entry) => entry.student.toString() === req.user.id);
  if (!isEnrolled) {
    return res.status(400).json({ message: "You must be enrolled in this course to leave a review" });
  }

  const existing = await Review.findOne({ course, student: req.user.id });
  if (existing) {
    return res.status(409).json({ message: "You have already reviewed this course" });
  }

  const review = await Review.create({ course, teacher, rating, comment, student: req.user.id });
  await refreshTeacherRating(teacher);
  await Notification.create({
    user: teacher,
    type: "review",
    message: `New ${rating}-star review on ${courseDoc.courseName}`,
    relatedCourse: course,
  });
  return res.status(201).json(review);
}

async function listTeacherReviews(req, res) {
  const reviews = await Review.find({ teacher: req.params.teacherId }).populate("student", "fullName").sort({ createdAt: -1 });
  return res.json(reviews);
}

module.exports = { addReview, listTeacherReviews };
