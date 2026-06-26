const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], required: true },
    whatsappNumber: { type: String },
    profileImageUrl: { type: String },
    telegramChannelLink: { type: String },
    bio: { type: String },
    experience: { type: String },
    introVideoUrl: { type: String },
    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalCommissionEarnings: { type: Number, default: 0 },
    kycStatus: { type: String, enum: ["not_submitted", "pending", "verified", "rejected"], default: "not_submitted" },
    kycDocumentUrl: { type: String },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
