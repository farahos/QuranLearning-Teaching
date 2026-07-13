// All content in this file is DEMO / LOCAL-ONLY fallback data used to keep the
// UI fully functional for features the backend does not implement yet
// (categories, playlists/sections/materials, notifications, favorites,
// certificates, logs, surveys, live sessions). It is never presented to the
// user as data that has been saved to a server. See the matching `// TODO(api)`
// comments in `src/api/*.js` for the endpoint each block is standing in for.

let uid = 0;
function id(prefix) {
  uid += 1;
  return `${prefix}-${uid}`;
}

// Categories have no pricing of their own — price lives on individual courses
// (see CourseForm) since a category can contain both free and paid courses.
export const demoCategories = [
  {
    id: id("cat"),
    name: "Quran Reading",
    description: "Foundational Qaidah and Mushaf reading fluency.",
    active: true,
    thumbnailUrl: "",
    courseCount: 2,
  },
  {
    id: id("cat"),
    name: "Tajweed",
    description: "Makharij, sifaat and recitation rules with corrections.",
    active: true,
    thumbnailUrl: "",
    courseCount: 3,
  },
  {
    id: id("cat"),
    name: "Hifz",
    description: "Structured memorization plans with daily revision.",
    active: true,
    thumbnailUrl: "",
    courseCount: 2,
  },
  {
    id: id("cat"),
    name: "Tafsir",
    description: "Understanding the meaning and context of the ayat.",
    active: true,
    thumbnailUrl: "",
    courseCount: 1,
  },
  {
    id: id("cat"),
    name: "Arabic for Quran",
    description: "Classical Arabic grammar and vocabulary for learners.",
    active: true,
    thumbnailUrl: "",
    courseCount: 1,
  },
  {
    id: id("cat"),
    name: "Islamic Studies",
    description: "Aqeedah, fiqh and seerah fundamentals.",
    active: false,
    thumbnailUrl: "",
    courseCount: 0,
  },
];

const playlistTemplate = (courseTitle) => [
  {
    id: id("playlist"),
    title: "Introduction",
    description: `Welcome and orientation for ${courseTitle}.`,
    order: 1,
    locked: false,
    preview: true,
    sections: [
      { id: id("section"), title: "Welcome and learning plan", type: "video", locked: false, preview: true, completed: true },
      { id: id("section"), title: "How this course is structured", type: "text", locked: false, preview: true, completed: true },
    ],
  },
  {
    id: id("playlist"),
    title: "Core practice",
    description: "Guided recitation and correction sessions.",
    order: 2,
    locked: false,
    preview: false,
    sections: [
      { id: id("section"), title: "Guided recitation session 1", type: "recitation", locked: false, preview: false, completed: false },
      { id: id("section"), title: "Makharij drill", type: "audio", locked: false, preview: false, completed: false },
    ],
  },
  {
    id: id("playlist"),
    title: "Advanced rules",
    description: "Deeper tajweed rules once fundamentals are solid.",
    order: 3,
    locked: true,
    preview: false,
    sections: [{ id: id("section"), title: "Heavy and light letters", type: "video", locked: true, preview: false, completed: false }],
  },
];

const materialsTemplate = () => [
  { id: id("material"), title: "Lesson slides", fileType: "PowerPoint", fileUrl: "", fileSize: "3.2 MB", downloadAllowed: true, disabled: false },
  { id: id("material"), title: "Rules summary sheet", fileType: "PDF", fileUrl: "", fileSize: "540 KB", downloadAllowed: false, disabled: false },
];

export const demoCourseExtras = [
  {
    level: "Beginner",
    language: "Arabic",
    duration: "6 weeks",
    shortDescription: "Read the Mushaf with confidence from day one.",
    learningOutcomes: ["Recognize all Arabic letters and forms", "Read simple words fluently", "Apply basic pause rules"],
    requirements: ["No prior experience needed", "A Mushaf or Quran app"],
    certificateEnabled: true,
    certificateRequiresAllLessons: true,
    certificateMinCompletion: 100,
    downloadableMaterials: true,
    playlists: playlistTemplate("Beginner Quran Reading"),
    materials: materialsTemplate(),
    surah: "Al-Fatiha",
    juz: "Juz 1",
    tajweedLevel: "Beginner",
  },
  {
    level: "Intermediate",
    language: "Arabic",
    duration: "8 weeks",
    shortDescription: "Master makharij and sifaat with live corrections.",
    learningOutcomes: ["Apply correct makharij for every letter", "Identify and fix common recitation mistakes", "Recite with proper madd rules"],
    requirements: ["Comfortable reading Arabic script"],
    certificateEnabled: true,
    certificateRequiresAllLessons: true,
    certificateMinCompletion: 90,
    downloadableMaterials: true,
    playlists: playlistTemplate("Tajweed Foundations"),
    materials: materialsTemplate(),
    surah: "Al-Baqarah",
    juz: "Juz 1-2",
    tajweedLevel: "Intermediate",
  },
  {
    level: "Beginner",
    language: "English",
    duration: "10 weeks",
    shortDescription: "A daily memorization plan for the 30th Juz.",
    learningOutcomes: ["Memorize Juz Amma with correct tajweed", "Build a sustainable daily revision habit"],
    requirements: ["Ability to read Quranic Arabic"],
    certificateEnabled: false,
    certificateRequiresAllLessons: false,
    certificateMinCompletion: 80,
    downloadableMaterials: true,
    playlists: playlistTemplate("Juz Amma Memorization"),
    materials: materialsTemplate(),
    surah: "An-Naba to An-Nas",
    juz: "Juz 30",
    tajweedLevel: "Intermediate",
  },
];

export const demoNotifications = [
  { id: id("notif"), type: "new_course", title: "New course published", message: "Tajweed Foundations is now available.", read: false, createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: id("notif"), type: "survey", title: "Survey request", message: "Share feedback for your completed lesson.", read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: id("notif"), type: "certificate", title: "Certificate ready", message: "Download your certificate once progress reaches 100%.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
  { id: id("notif"), type: "teacher_feedback", title: "Teacher feedback received", message: "Ustaad Abdirahman left feedback on your recitation.", read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
  { id: id("notif"), type: "live_class", title: "Live class reminder", message: "Tajweed live session starts in 30 minutes.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString() },
];

export const demoLogs = [
  { id: id("log"), event: "Teacher registration accepted", actor: "Admin User", role: "admin", action: "approve_teacher", date: "2026-07-11 09:12" },
  { id: id("log"), event: "Course material download disabled", actor: "Ustaad Abdirahman", role: "teacher", action: "update_material", date: "2026-07-10 15:45" },
  { id: id("log"), event: "Refund request submitted", actor: "Amina Hassan", role: "student", action: "request_refund", date: "2026-07-10 11:03" },
];

export const demoSurveys = [
  {
    id: id("survey"),
    title: "Tajweed Foundations – mid-course check-in",
    description: "Quick pulse check on pacing and difficulty.",
    status: "published",
    responses: 12,
    questions: [
      { id: id("q"), type: "rating", label: "How clear are the makharij explanations?" },
      { id: id("q"), type: "multiple_choice", label: "Preferred class pace", options: ["Slower", "Just right", "Faster"] },
      { id: id("q"), type: "text", label: "Anything you'd like more practice on?" },
    ],
  },
];

export const demoLiveSessions = [
  { id: id("live"), courseTitle: "Tajweed Foundations", topic: "Group correction session", date: "2026-07-15", time: "18:00", link: "" },
  { id: id("live"), courseTitle: "Juz Amma Memorization", topic: "Weekly revision circle", date: "2026-07-17", time: "19:30", link: "" },
];

export const demoRefunds = [
  { id: id("refund"), studentName: "Amina Hassan", courseTitle: "Tajweed Foundations", amount: 100, reason: "Duplicate payment", status: "pending", requestedAt: "2026-07-09" },
];

export const demoGuardianSummary = {
  studentName: "Amina Hassan",
  weeklyMemorizationTarget: "Surah Al-Mulk (1-15)",
  revisionStreakDays: 6,
  lastTeacherNote: "Good progress on makharij for heavy letters; keep practicing daily revision.",
};
