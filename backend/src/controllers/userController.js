const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function getMe(req, res) {
  const user = await User.findById(req.user.id).select("-passwordHash");
  return res.json(user);
}

async function updateProfile(req, res) {
  const allowed = ["fullName", "profileImageUrl", "whatsappNumber", "bio", "experience"];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select("-passwordHash");
  return res.json(user);
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Current password and a new password of at least 6 characters are required" });
  }

  const user = await User.findById(req.user.id);
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.json({ message: "Password changed" });
}

async function updateTeacherProfile(req, res) {
  const updates = req.body;
  const user = await User.findOneAndUpdate(
    { _id: req.user.id, role: "teacher" },
    { $set: updates },
    { new: true }
  ).select("-passwordHash");

  if (!user) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  return res.json(user);
}

module.exports = { getMe, updateProfile, changePassword, updateTeacherProfile };
