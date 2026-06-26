const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role, fullName: user.fullName }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d"
  });
}

async function register(req, res) {
  const { fullName, email, password, role } = req.body;
  if (!["student", "teacher"].includes(role)) {
    return res.status(400).json({ message: "Only student and teacher registration is available from the app" });
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, passwordHash, role });
  const token = signToken(user);
  return res.status(201).json({ token, user });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = signToken(user);
  return res.json({ token, user });
}

module.exports = { register, login };
