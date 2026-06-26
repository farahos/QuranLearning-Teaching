const Course = require("../models/Course");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.passwordHash;
  return obj;
}

async function dashboard(req, res) {
  const [totalUsers, totalStudents, totalTeachers, totalAdmins, totalCourses, completedPayments, pendingKyc] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    User.countDocuments({ role: "admin" }),
    Course.countDocuments(),
    Transaction.find({ status: "completed" }),
    User.countDocuments({ kycStatus: "pending" }),
  ]);

  const totalRevenue = completedPayments
    .filter((transaction) => transaction.type === "course_payment")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const adminCommission = completedPayments
    .filter((transaction) => transaction.type === "admin_commission")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return res.json({
    users: { total: totalUsers, students: totalStudents, teachers: totalTeachers, admins: totalAdmins },
    courses: { total: totalCourses },
    payments: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      adminCommission: Number(adminCommission.toFixed(2)),
      completedCount: completedPayments.length,
    },
    kyc: { pending: pendingKyc },
  });
}

async function listUsers(req, res) {
  const { role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
  return res.json(users.map(sanitizeUser));
}

async function updateUser(req, res) {
  const allowed = ["role", "kycStatus", "fullName", "walletBalance"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(sanitizeUser(user));
}

async function deleteUser(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "You cannot delete your own admin account" });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ message: "User deleted" });
}

async function listCourses(req, res) {
  const courses = await Course.find()
    .sort({ createdAt: -1 })
    .populate("teacher", "fullName email averageRating totalReviews profileImageUrl");
  return res.json(courses);
}

async function deleteCourse(req, res) {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  return res.json({ message: "Course deleted" });
}

async function listTransactions(req, res) {
  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("user", "fullName email role");
  return res.json(transactions);
}

module.exports = {
  dashboard,
  listUsers,
  updateUser,
  deleteUser,
  listCourses,
  deleteCourse,
  listTransactions,
};
