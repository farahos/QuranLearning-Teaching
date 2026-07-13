const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "", trim: true },
    thumbnailUrl: { type: String, default: "", trim: true },
    active: { type: Boolean, default: true },
    price: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
