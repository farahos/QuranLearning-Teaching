const crypto = require("crypto");
const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    certificateCode: { type: String, required: true, default: () => crypto.randomBytes(6).toString("hex").toUpperCase() },
    issuedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

certificateSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", certificateSchema);
