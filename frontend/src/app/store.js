import { configureStore } from "@reduxjs/toolkit";
import { onUnauthorized } from "../api/client";
import authReducer, { logout } from "../features/auth/authSlice";
import categoryReducer from "../features/categories/categorySlice";
import courseReducer from "../features/courses/courseSlice";
import teacherReducer from "../features/teacher/teacherSlice";
import studentReducer, { hydrateStudentState } from "../features/student/studentSlice";
import adminReducer from "../features/admin/adminSlice";
import paymentReducer from "../features/payments/paymentSlice";
import notificationReducer from "../features/notifications/notificationSlice";

const STUDENT_STORAGE_KEY = "quranconnect.student.v1";

function loadStudentState() {
  try {
    const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    courses: courseReducer,
    teacher: teacherReducer,
    student: studentReducer,
    admin: adminReducer,
    payments: paymentReducer,
    notifications: notificationReducer,
  },
});

onUnauthorized(() => {
  if (store.getState().auth.token) store.dispatch(logout());
});

const savedStudentState = loadStudentState();
if (savedStudentState) store.dispatch(hydrateStudentState(savedStudentState));

let persistTimer = null;
store.subscribe(() => {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const { progress, favorites, freeEnrollments, recitations, myReviews } = store.getState().student;
    try {
      localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify({ progress, favorites, freeEnrollments, recitations, myReviews }));
    } catch {
      // storage unavailable (private mode / quota) — progress just won't persist
    }
  }, 300);
});
