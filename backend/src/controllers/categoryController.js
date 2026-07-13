const Category = require("../models/Category");
const Course = require("../models/Course");

const defaultCategories = [
  { name: "Quran Reading", description: "Foundational Qaidah and Mushaf reading fluency.", active: true, thumbnailUrl: "", price: 0 },
  { name: "Tajweed", description: "Makharij, sifaat and recitation rules with corrections.", active: true, thumbnailUrl: "", price: 15 },
  { name: "Hifz", description: "Structured memorization plans with daily revision.", active: true, thumbnailUrl: "", price: 25 },
  { name: "Tafsir", description: "Understanding the meaning and context of the ayat.", active: true, thumbnailUrl: "", price: 20 },
  { name: "Arabic for Quran", description: "Classical Arabic grammar and vocabulary for learners.", active: true, thumbnailUrl: "", price: 15 },
  { name: "Islamic Studies", description: "Aqeedah, fiqh and seerah fundamentals.", active: false, thumbnailUrl: "", price: 0 },
];

async function ensureDefaultCategories() {
  const count = await Category.estimatedDocumentCount();
  if (count === 0) {
    await Category.insertMany(defaultCategories, { ordered: false });
  }
}

async function getCourseCounts() {
  const rows = await Course.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
  return rows.reduce((acc, row) => {
    if (row._id) acc[row._id] = row.count;
    return acc;
  }, {});
}

function toClientCategory(category, courseCounts = {}) {
  const obj = category.toObject ? category.toObject() : { ...category };
  return { ...obj, id: String(obj._id), courseCount: courseCounts[obj.name] || 0 };
}

async function listCategories(_req, res) {
  await ensureDefaultCategories();
  const [categories, courseCounts] = await Promise.all([
    Category.find().sort({ createdAt: 1, name: 1 }),
    getCourseCounts(),
  ]);
  return res.json(categories.map((category) => toClientCategory(category, courseCounts)));
}

async function createCategory(req, res) {
  const payload = normalizePayload(req.body);
  const existing = await findByName(payload.name);
  if (existing) {
    return res.status(409).json({ message: "Category name already exists" });
  }
  const category = await Category.create(payload);
  return res.status(201).json(toClientCategory(category));
}

async function updateCategory(req, res) {
  const current = await Category.findById(req.params.id);
  if (!current) {
    return res.status(404).json({ message: "Category not found" });
  }

  const payload = normalizePayload(req.body, { partial: true });
  if (payload.name && payload.name.toLowerCase() !== current.name.toLowerCase()) {
    const existing = await findByName(payload.name);
    if (existing) {
      return res.status(409).json({ message: "Category name already exists" });
    }
  }

  const previousName = current.name;
  Object.assign(current, payload);
  await current.save();

  if (payload.name && payload.name !== previousName) {
    await Course.updateMany({ category: previousName }, { $set: { category: payload.name } });
  }

  const courseCounts = await getCourseCounts();
  return res.json(toClientCategory(current, courseCounts));
}

async function deleteCategory(req, res) {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  return res.json({ message: "Category deleted" });
}

function normalizePayload(body, { partial = false } = {}) {
  const payload = {};
  if (body.name !== undefined) payload.name = String(body.name).trim();
  if (body.description !== undefined) payload.description = String(body.description).trim();
  if (body.thumbnailUrl !== undefined) payload.thumbnailUrl = String(body.thumbnailUrl).trim();
  if (body.active !== undefined) payload.active = Boolean(body.active);
  if (body.price !== undefined) payload.price = Number(body.price) || 0;

  if ((!partial || payload.name !== undefined) && !payload.name) {
    const error = new Error("Category name is required");
    error.status = 400;
    throw error;
  }
  if (payload.price !== undefined && payload.price < 0) {
    const error = new Error("Price cannot be negative");
    error.status = 400;
    throw error;
  }
  return payload;
}

function findByName(name) {
  return Category.findOne({ name: new RegExp(`^${escapeRegExp(name)}$`, "i") });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
