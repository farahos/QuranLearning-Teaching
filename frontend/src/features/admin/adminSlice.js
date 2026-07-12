import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminApi } from "../../api/adminApi";
import { demoLogs } from "../../data/demoData";

const initialState = {
  dashboard: null,
  dashboardStatus: "idle",

  users: [],
  usersStatus: "idle",

  courses: [],
  coursesStatus: "idle",

  transactions: [],
  transactionsStatus: "idle",

  teacherActionStatus: "idle",
  // TODO(api): rejection feedback text has nowhere to persist server-side yet.
  teacherFeedback: {}, // teacherId -> feedback string

  // TODO(api): GET /api/admin/logs — demo data until then.
  logs: demoLogs,
  // TODO(api): GET/PUT /api/admin/settings — demo defaults, edits are local only.
  settings: {
    platformName: "Quran Connect",
    platformLogoUrl: "",
    supportEmail: "support@quranconnect.test",
    supportPhone: "",
    defaultCurrency: "USD",
    platformFeePercent: 20,
    certificatesEnabled: true,
    maintenanceMode: false,
    registrationEnabled: true,
    teacherApprovalRequired: true,
  },

  message: "",
  error: "",
};

export const fetchAdminDashboard = createAsyncThunk("admin/fetchDashboard", async (_, { rejectWithValue }) => {
  try {
    return await adminApi.dashboard();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchAdminUsers = createAsyncThunk("admin/fetchUsers", async (params, { rejectWithValue }) => {
  try {
    return await adminApi.listUsers(params);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateAdminUser = createAsyncThunk("admin/updateUser", async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await adminApi.updateUser(id, payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteAdminUser = createAsyncThunk("admin/deleteUser", async (id, { rejectWithValue }) => {
  try {
    await adminApi.deleteUser(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchAdminCourses = createAsyncThunk("admin/fetchCourses", async (params, { rejectWithValue }) => {
  try {
    return await adminApi.listCourses(params);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteAdminCourse = createAsyncThunk("admin/deleteCourse", async (id, { rejectWithValue }) => {
  try {
    await adminApi.deleteCourse(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchAdminTransactions = createAsyncThunk("admin/fetchTransactions", async (params, { rejectWithValue }) => {
  try {
    return await adminApi.listTransactions(params);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const approveTeacherRequest = createAsyncThunk("admin/approveTeacher", async (teacherId, { rejectWithValue }) => {
  try {
    return await adminApi.approveTeacher(teacherId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const rejectTeacherRequest = createAsyncThunk("admin/rejectTeacher", async ({ teacherId, feedback }, { rejectWithValue }) => {
  try {
    const user = await adminApi.rejectTeacher(teacherId);
    return { user, feedback };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminMessage(state) {
      state.message = "";
      state.error = "";
    },
    updateSettingsLocal(state, action) {
      state.settings = { ...state.settings, ...action.payload };
      state.message = "Settings updated (demo only — not connected to the backend yet)";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.dashboardStatus = "loading";
        state.error = "";
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.dashboardStatus = "succeeded";
        state.dashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.dashboardStatus = "failed";
        state.error = action.payload || "Could not load dashboard";
      })
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersStatus = "loading";
        state.error = "";
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersStatus = "succeeded";
        state.users = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersStatus = "failed";
        state.error = action.payload || "Could not load users";
      })
      .addCase(updateAdminUser.fulfilled, (state, action) => {
        state.users = state.users.map((user) => (user._id === action.payload._id ? action.payload : user));
        state.message = "User updated";
      })
      .addCase(updateAdminUser.rejected, (state, action) => {
        state.error = action.payload || "Could not update user";
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
        state.message = "User deleted";
      })
      .addCase(deleteAdminUser.rejected, (state, action) => {
        state.error = action.payload || "Could not delete user";
      })
      .addCase(fetchAdminCourses.pending, (state) => {
        state.coursesStatus = "loading";
      })
      .addCase(fetchAdminCourses.fulfilled, (state, action) => {
        state.coursesStatus = "succeeded";
        state.courses = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdminCourses.rejected, (state, action) => {
        state.coursesStatus = "failed";
        state.error = action.payload || "Could not load courses";
      })
      .addCase(deleteAdminCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter((course) => course._id !== action.payload);
        state.message = "Course removed";
      })
      .addCase(fetchAdminTransactions.pending, (state) => {
        state.transactionsStatus = "loading";
      })
      .addCase(fetchAdminTransactions.fulfilled, (state, action) => {
        state.transactionsStatus = "succeeded";
        state.transactions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdminTransactions.rejected, (state, action) => {
        state.transactionsStatus = "failed";
        state.error = action.payload || "Could not load transactions";
      })
      .addCase(approveTeacherRequest.pending, (state) => {
        state.teacherActionStatus = "loading";
      })
      .addCase(approveTeacherRequest.fulfilled, (state, action) => {
        state.teacherActionStatus = "succeeded";
        state.users = state.users.map((user) => (user._id === action.payload._id ? action.payload : user));
        state.message = "Teacher approved";
      })
      .addCase(approveTeacherRequest.rejected, (state, action) => {
        state.teacherActionStatus = "failed";
        state.error = action.payload || "Could not approve teacher";
      })
      .addCase(rejectTeacherRequest.pending, (state) => {
        state.teacherActionStatus = "loading";
      })
      .addCase(rejectTeacherRequest.fulfilled, (state, action) => {
        state.teacherActionStatus = "succeeded";
        const { user, feedback } = action.payload;
        state.users = state.users.map((item) => (item._id === user._id ? user : item));
        if (feedback) state.teacherFeedback[user._id] = feedback;
        state.message = "Teacher registration rejected";
      })
      .addCase(rejectTeacherRequest.rejected, (state, action) => {
        state.teacherActionStatus = "failed";
        state.error = action.payload || "Could not reject teacher";
      });
  },
});

export const { clearAdminMessage, updateSettingsLocal } = adminSlice.actions;
export default adminSlice.reducer;
