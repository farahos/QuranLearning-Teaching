const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    commissionRate: { type: Number, enum: [0.15, 0.2], default: 0.2 },
    category: { type: String, default: "General" },
    coverImageUrl: { type: String },
    introVideoUrl: { type: String },
    lessons: [
      {
        title: { type: String, required: true },
        videoUrl: { type: String, required: true }
      }
    ],
    enrolledStudents: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        purchasedAt: { type: Date, default: Date.now },
        paymentMethod: { type: String },
        phoneNumber: { type: String }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
