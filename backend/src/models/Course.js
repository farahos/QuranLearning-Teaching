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
        type: { type: String, default: "video" },
        videoUrl: { type: String, default: "" },
        description: { type: String, default: "" },
        locked: { type: Boolean, default: false },
        preview: { type: Boolean, default: false }
      }
    ],
    materials: [
      {
        id: { type: String },
        title: { type: String, required: true },
        fileType: { type: String, default: "PDF" },
        fileUrl: { type: String, required: true },
        fileSize: { type: String, default: "" },
        sectionId: { type: String, default: null },
        downloadAllowed: { type: Boolean, default: true },
        disabled: { type: Boolean, default: false }
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
