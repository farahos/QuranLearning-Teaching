const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role, fullName: user.fullName }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d"
  });
}

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  return obj;
}

async function register(req, res) {
  const {
    fullName,
    email,
    password,
    role,
    whatsappNumber,
    profileImageUrl,
    telegramChannelLink,
    bio,
    experience,
    introVideoUrl,
    kycDocumentUrl,
    learningGoal,
    guardianPhone,
    adminInviteCode,
  } = req.body;

  if (!["student", "teacher", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (role === "admin") {
    const expectedInvite = process.env.ADMIN_INVITE_CODE || "QLT-ADMIN-2026";
    if (adminInviteCode !== expectedInvite) {
      return res.status(403).json({ message: "Invalid admin invite code" });
    }
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    role,
    whatsappNumber,
    profileImageUrl,
    telegramChannelLink,
    bio,
    experience,
    introVideoUrl,
    kycDocumentUrl,
    learningGoal,
    guardianPhone,
    active: role !== "teacher",
    kycStatus: role === "teacher" ? "pending" : "not_submitted",
  });
  const token = signToken(user);
  return res.status(201).json({ token, user: sanitizeUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: "Email ma jiro" });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Password waa khalad" });
  }
  if (user.active === false) {
    return res.status(403).json({ message: "Your account is not active yet" });
  }
  const token = signToken(user);
  return res.json({ token, user: sanitizeUser(user) });
}

module.exports = { register, login };
