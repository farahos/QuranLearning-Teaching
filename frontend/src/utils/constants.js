export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  [ROLES.STUDENT]: "Student",
  [ROLES.TEACHER]: "Teacher",
  [ROLES.ADMIN]: "Admin",
};

export const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

export const COURSE_STATUS_LABELS = {
  [COURSE_STATUS.DRAFT]: "Draft",
  [COURSE_STATUS.PUBLISHED]: "Published",
  [COURSE_STATUS.ARCHIVED]: "Archived",
};

export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const COURSE_LANGUAGES = ["Arabic", "English", "Somali", "Urdu"];

export const LESSON_TYPES = [
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "text", label: "Text" },
  { value: "pdf", label: "PDF" },
  { value: "powerpoint", label: "PowerPoint" },
  { value: "live", label: "Live class" },
  { value: "recitation", label: "Quran recitation task" },
  { value: "quiz", label: "Quiz" },
];

export const TAJWEED_LEVELS = ["Not started", "Beginner", "Intermediate", "Advanced", "Ijazah track"];

export const PAYMENT_METHODS = [
  { value: "EVC Plus", label: "EVC Plus (Waafi)" },
  { value: "Zaad", label: "Zaad (Waafi)" },
  { value: "Sahal", label: "Sahal (Waafi)" },
];

export const KYC_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
};

export const KYC_STATUS_LABELS = {
  [KYC_STATUS.NOT_SUBMITTED]: "Not submitted",
  [KYC_STATUS.PENDING]: "Pending review",
  [KYC_STATUS.VERIFIED]: "Verified",
  [KYC_STATUS.REJECTED]: "Rejected",
};

export const TRANSACTION_TYPES = {
  COURSE_PAYMENT: "course_payment",
  COURSE_INCOME: "course_income",
  ADMIN_COMMISSION: "admin_commission",
  REFUND: "refund",
  WITHDRAWAL: "withdrawal",
};

export const DEFAULT_CURRENCY = "USD";

export const ADMIN_INVITE_HINT = "Ask your platform administrator for the current invite code.";

export const QURAN_CATEGORIES = ["Quran Reading", "Tajweed", "Hifz", "Tafsir", "Arabic for Quran", "Islamic Studies"];
