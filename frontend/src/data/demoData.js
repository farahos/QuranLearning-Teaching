export const demoUser = {
  _id: "teacher-demo",
  fullName: "Ustaad Abdirahman",
  email: "teacher@quran.test",
  role: "teacher",
  walletBalance: 1240,
  averageRating: 4.8,
  totalReviews: 128,
  kycStatus: "verified",
};

export const demoCourses = [
  {
    _id: "course-1",
    courseName: "Tajweed Foundations",
    description: "Learn makharij, sifaat, and practical recitation corrections.",
    price: 100,
    category: "Quran",
    coverImageUrl: "/uploads/images/1782499015105-islamic-new-year-quran-book-with-dates-photo.jpg",
    teacher: demoUser,
    paymentType: "paid",
    paymentMethod: "waafi",
    certificateEnabled: true,
    advancementEnabled: true,
    rating: 4.9,
    feedbackCount: 46,
    progress: 72,
    favorite: true,
    materials: [
      { id: "m1", name: "Tajweed slides.pptx", type: "PowerPoint", downloadAllowed: true, disabled: false },
      { id: "m2", name: "Rules summary.pdf", type: "PDF", downloadAllowed: false, disabled: false },
    ],
    playlists: [
      {
        id: "p1",
        title: "Introduction",
        locked: false,
        sections: [
          { id: "s1", title: "Welcome and learning plan", locked: false, completed: true },
          { id: "s2", title: "Makharij overview", locked: false, completed: true },
        ],
      },
      {
        id: "p2",
        title: "Advanced rules",
        locked: true,
        sections: [{ id: "s3", title: "Heavy and light letters", locked: true, completed: false }],
      },
    ],
    enrolledStudents: [
      { student: { fullName: "Amina Hassan", email: "amina@example.com" }, purchasedAt: "2026-06-23", paymentMethod: "waafi" },
      { student: { fullName: "Yusuf Ali", email: "yusuf@example.com" }, purchasedAt: "2026-07-02", paymentMethod: "waafi" },
    ],
  },
  {
    _id: "course-2",
    courseName: "Memorization Routine",
    description: "Daily hifz plan with revision tracking and teacher feedback.",
    price: 0,
    category: "Hifz",
    coverImageUrl: "/uploads/images/1782498972372-download.jpg",
    teacher: demoUser,
    paymentType: "free",
    paymentMethod: "free",
    certificateEnabled: false,
    advancementEnabled: true,
    rating: 4.6,
    feedbackCount: 22,
    progress: 38,
    favorite: false,
    materials: [{ id: "m3", name: "Weekly plan.pdf", type: "PDF", downloadAllowed: true, disabled: false }],
    playlists: [{ id: "p3", title: "Week 1", locked: false, sections: [{ id: "s4", title: "Review loop", locked: false, completed: false }] }],
    enrolledStudents: [{ student: { fullName: "Maryan Omar", email: "maryan@example.com" }, purchasedAt: "2026-07-08", paymentMethod: "free" }],
  },
];

export const demoUsers = [
  demoUser,
  { _id: "admin-demo", fullName: "Admin User", email: "admin@quran.test", role: "admin", active: true, kycStatus: "verified" },
  { _id: "student-demo", fullName: "Amina Hassan", email: "amina@example.com", role: "student", active: true, kycStatus: "not_submitted" },
  { _id: "teacher-pending", fullName: "Hodan Teacher", email: "hodan@example.com", role: "teacher", active: false, kycStatus: "pending" },
];

export const demoTransactions = [
  { _id: "t1", type: "course_payment", amount: 100, status: "completed", user: demoUsers[2], course: "Tajweed Foundations", createdAt: "2026-07-02", refundable: true },
  { _id: "t2", type: "admin_commission", amount: 20, status: "completed", user: demoUser, course: "Tajweed Foundations", createdAt: "2026-07-02", refundable: false },
  { _id: "t3", type: "refund", amount: 40, status: "pending", user: demoUsers[2], course: "Memorization Routine", createdAt: "2026-07-10", refundable: false },
];

export const demoLogs = [
  { id: "l1", event: "Teacher registration accepted", actor: "Admin User", date: "2026-07-11 09:12" },
  { id: "l2", event: "Course material download disabled", actor: "Ustaad Abdirahman", date: "2026-07-10 15:45" },
  { id: "l3", event: "Refund request submitted", actor: "Amina Hassan", date: "2026-07-10 11:03" },
];
