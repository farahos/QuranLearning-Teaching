import { configureStore } from "@reduxjs/toolkit";
import { onUnauthorized } from "../api/client";
import authReducer, { logout } from "../features/auth/authSlice";
import categoryReducer from "../features/categories/categorySlice";
import courseReducer from "../features/courses/courseSlice";
import teacherReducer from "../features/teacher/teacherSlice";
import studentReducer from "../features/student/studentSlice";
import adminReducer from "../features/admin/adminSlice";
import paymentReducer from "../features/payments/paymentSlice";
import notificationReducer from "../features/notifications/notificationSlice";

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
