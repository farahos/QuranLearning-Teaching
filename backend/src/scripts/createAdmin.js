require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/db");
const User = require("../models/User");

async function createAdmin() {
  const fullName = process.env.ADMIN_FULL_NAME || "Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 6) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD with at least 6 characters are required in .env");
  }

  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.role = "admin";
    existing.fullName = fullName;
    await existing.save();
    console.log(`Updated existing user ${email} to admin`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ fullName, email, passwordHash, role: "admin" });
  console.log(`Created admin user ${email}`);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
