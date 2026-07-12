import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api/client";
import { demoCourses, demoTransactions, demoUser, demoUsers } from "../data/demoData";
import { mergeCourseDefaults } from "../utils/courseUtils";

const initialState = {
  token: localStorage.getItem("qlt_token") || "",
  role: localStorage.getItem("qlt_role") || "teacher",
  user: demoUser,
  courses: demoCourses,
  users: demoUsers,
  transactions: demoTransactions,
  active: "overview",
  toast: "",
  authView: null,
  status: "idle",
  error: "",
};

export const fetchCourses = createAsyncThunk("portal/fetchCourses", async () => {
  const data = await api.get("/courses");
  return Array.isArray(data) ? mergeCourseDefaults(data) : [];
});

export const loginUser = createAsyncThunk("portal/loginUser", async ({ email, password }) => {
  return api.post("/auth/login", { email, password });
});

export const registerUser = createAsyncThunk("portal/registerUser", async (payload) => {
  return api.post("/auth/register", payload);
});

const portalSlice = createSlice({
  name: "portal",
  initialState,
  reducers: {
    setRole(state, action) {
      state.role = action.payload;
      state.active = "overview";
      state.user = { ...state.user, role: action.payload };
      localStorage.setItem("qlt_role", action.payload);
    },
    setActive(state, action) {
      state.active = action.payload;
      state.authView = null;
    },
    setAuthView(state, action) {
      state.authView = action.payload;
    },
    clearToast(state) {
      state.toast = "";
    },
    setToast(state, action) {
      state.toast = action.payload;
    },
    logout(state) {
      state.token = "";
      state.user = { ...demoUser, role: state.role };
      state.toast = "Signed out";
      localStorage.removeItem("qlt_token");
    },
    saveCourse(state, action) {
      const course = action.payload;
      if (course._id) {
        state.courses = state.courses.map((item) => (item._id === course._id ? { ...item, ...course } : item));
        state.toast = "Course updated";
      } else {
        state.courses = [{ ...course, _id: crypto.randomUUID(), teacher: state.user, enrolledStudents: [], rating: 0, feedbackCount: 0 }, ...state.courses];
        state.toast = "Course created";
      }
    },
    deleteCourse(state, action) {
      state.courses = state.courses.filter((course) => course._id !== action.payload);
      state.toast = "Course deleted";
    },
    updateCourse(state, action) {
      const { id, updates } = action.payload;
      state.courses = state.courses.map((course) => (course._id === id ? { ...course, ...updates } : course));
    },
    updateUser(state, action) {
      const { id, updates } = action.payload;
      state.users = state.users.map((user) => (user._id === id ? { ...user, ...updates } : user));
      state.toast = "User updated";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.fulfilled, (state, action) => {
        if (action.payload.length) state.courses = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.authView = null;
        state.toast = "Logged in successfully";
        localStorage.setItem("qlt_token", action.payload.token);
        localStorage.setItem("qlt_role", action.payload.user.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.error.message || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.authView = null;
        state.toast = action.payload.user.role === "teacher" ? "Teacher registration submitted for approval" : "Registration completed";
        localStorage.setItem("qlt_token", action.payload.token);
        localStorage.setItem("qlt_role", action.payload.user.role);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.error.message || "Registration failed";
      });
  },
});

export const { setRole, setActive, setAuthView, clearToast, setToast, logout, saveCourse, deleteCourse, updateCourse, updateUser } = portalSlice.actions;
export default portalSlice.reducer;
