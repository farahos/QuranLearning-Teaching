const Progress = require("../models/Progress");
const Course = require("../models/Course");
const Certificate = require("../models/Certificate");

async function getProgress(req, res) {
  const progress = await Progress.findOne({ student: req.user.id, course: req.params.courseId });
  return res.json(
    progress || { student: req.user.id, course: req.params.courseId, completedLessonIds: [], lastAccessedLessonId: "" }
  );
}

async function updateProgress(req, res) {
  const { lessonId, completed = true } = req.body;
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const update = { $set: { lastAccessedLessonId: lessonId } };
  if (completed) {
    update.$addToSet = { completedLessonIds: lessonId };
  }

  const progress = await Progress.findOneAndUpdate(
    { student: req.user.id, course: req.params.courseId },
    update,
    { new: true, upsert: true }
  );

  const totalLessons = course.lessons.length;
  if (totalLessons > 0 && progress.completedLessonIds.length >= totalLessons) {
    await Certificate.findOneAndUpdate(
      { student: req.user.id, course: req.params.courseId },
      { student: req.user.id, course: req.params.courseId },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  return res.json(progress);
}

module.exports = { getProgress, updateProgress };
