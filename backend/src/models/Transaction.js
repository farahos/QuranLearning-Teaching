const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["course_payment", "course_income", "admin_commission"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    note: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
