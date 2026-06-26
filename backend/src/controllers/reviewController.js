const Review = require("../models/Review");
const User = require("../models/User");

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
  const review = await Review.create({ course, teacher, rating, comment, student: req.user.id });
  await refreshTeacherRating(teacher);
  return res.status(201).json(review);
}

async function listTeacherReviews(req, res) {
  const reviews = await Review.find({ teacher: req.params.teacherId }).populate("student", "fullName").sort({ createdAt: -1 });
  return res.json(reviews);
}

module.exports = { addReview, listTeacherReviews };
