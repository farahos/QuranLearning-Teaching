const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Course = require("../models/Course");

async function walletDashboard(req, res) {
  const user = await User.findById(req.user.id).select("walletBalance totalEarnings totalCommissionEarnings role kycStatus");
  const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(30);
  return res.json({ wallet: user, transactions });
}

async function payCourse(req, res) {
  const { courseId, paymentMethod, phoneNumber } = req.body;
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const student = await User.findById(req.user.id);
  if (!student || student.role !== "student") {
    return res.status(403).json({ message: "Only students can buy courses" });
  }

  const teacher = await User.findById(course.teacher);
  const admin = await User.findOne({ role: "admin" });
  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }
  if (!admin) {
    return res.status(400).json({ message: "Admin account is required before processing payments" });
  }

  const commissionRate = course.commissionRate || 0.2;
  const adminCommission = Number((course.price * commissionRate).toFixed(2));
  const teacherIncome = Number((course.price - adminCommission).toFixed(2));

  const alreadyEnrolled = course.enrolledStudents.some((entry) => entry.student.toString() === student._id.toString());
  if (!alreadyEnrolled) {
    course.enrolledStudents.push({
      student: student._id,
      paymentMethod,
      phoneNumber
    });
    await course.save();
  }

  teacher.walletBalance += teacherIncome;
  teacher.totalEarnings += teacherIncome;
  await teacher.save();

  admin.walletBalance += adminCommission;
  admin.totalCommissionEarnings += adminCommission;
  await admin.save();

  await Transaction.create({
    user: student._id,
    type: "course_payment",
    amount: course.price,
    status: "completed",
    note: `Payment for ${course.courseName}${paymentMethod ? ` via ${paymentMethod}` : ""}${phoneNumber ? ` (${phoneNumber})` : ""}`
  });
  await Transaction.create({
    user: teacher._id,
    type: "course_income",
    amount: teacherIncome,
    status: "completed",
    note: `Income from ${course.courseName}`
  });
  await Transaction.create({
    user: admin._id,
    type: "admin_commission",
    amount: adminCommission,
    status: "completed",
    note: `Commission from ${course.courseName}`
  });

  return res.json({
    message: "Payment completed",
    split: { teacherIncome, adminCommission, commissionRate },
    telegramChannelLink: teacher.telegramChannelLink
  });
}

module.exports = { walletDashboard, payCourse };
