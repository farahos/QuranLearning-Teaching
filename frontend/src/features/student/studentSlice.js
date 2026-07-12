import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { studentApi } from "../../api/studentApi";

const initialState = {
  // TODO(api): GET/POST/DELETE /api/favorites — tracked locally (course ids) until then.
  favorites: [],
  // TODO(api): GET/POST /api/progress — tracked locally per course until then.
  // shape: { [courseId]: { completedSectionIds: string[], lastAccessedSectionId, notes: {}, updatedAt } }
  progress: {},
  // TODO(api): POST /api/enrollments (free courses only — paid purchases are real, via payment.result).
  freeEnrollments: [],
  // TODO(api): POST /api/recitations
  recitations: [],

  payment: { status: "idle", error: "", result: null },
  reviewStatus: "idle",
  reviewError: "",
  // Own submitted ratings are tracked locally because the backend has no
  // "my reviews" / edit / delete review endpoints yet, only create.
  myReviews: [],

  message: "",
  error: "",
};

export const payForCourse = createAsyncThunk("student/payForCourse", async (payload, { rejectWithValue }) => {
  try {
    return await studentApi.payCourse(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const submitCourseReview = createAsyncThunk("student/submitReview", async (payload, { rejectWithValue }) => {
  try {
    return await studentApi.submitReview(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    clearStudentMessage(state) {
      state.message = "";
      state.error = "";
    },
    resetPaymentState(state) {
      state.payment = { status: "idle", error: "", result: null };
    },
    toggleFavorite(state, action) {
      const courseId = action.payload;
      state.favorites = state.favorites.includes(courseId) ? state.favorites.filter((id) => id !== courseId) : [...state.favorites, courseId];
    },
    enrollFree(state, action) {
      const courseId = action.payload;
      if (!state.freeEnrollments.includes(courseId)) state.freeEnrollments.push(courseId);
      state.message = "Enrolled (demo only — free enrollment is not connected to the backend yet)";
    },
    markSectionComplete(state, action) {
      const { courseId, sectionId } = action.payload;
      const entry = state.progress[courseId] || { completedSectionIds: [], notes: {} };
      if (!entry.completedSectionIds.includes(sectionId)) entry.completedSectionIds.push(sectionId);
      entry.lastAccessedSectionId = sectionId;
      entry.updatedAt = new Date().toISOString();
      state.progress[courseId] = entry;
    },
    setLastAccessed(state, action) {
      const { courseId, sectionId } = action.payload;
      const entry = state.progress[courseId] || { completedSectionIds: [], notes: {} };
      entry.lastAccessedSectionId = sectionId;
      state.progress[courseId] = entry;
    },
    saveLessonNote(state, action) {
      const { courseId, sectionId, note } = action.payload;
      const entry = state.progress[courseId] || { completedSectionIds: [], notes: {} };
      entry.notes = { ...entry.notes, [sectionId]: note };
      state.progress[courseId] = entry;
    },
    submitRecitation(state, action) {
      state.recitations = [{ id: `recitation-${Date.now()}`, submittedAt: new Date().toISOString(), status: "pending", ...action.payload }, ...state.recitations];
      state.message = "Recitation submitted (demo only — not connected to the backend yet)";
    },
    editMyReview(state, action) {
      const { id, updates } = action.payload;
      state.myReviews = state.myReviews.map((review) => (review._id === id ? { ...review, ...updates } : review));
    },
    deleteMyReview(state, action) {
      state.myReviews = state.myReviews.filter((review) => review._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(payForCourse.pending, (state) => {
        state.payment = { status: "loading", error: "", result: null };
      })
      .addCase(payForCourse.fulfilled, (state, action) => {
        state.payment = { status: "succeeded", error: "", result: action.payload };
      })
      .addCase(payForCourse.rejected, (state, action) => {
        state.payment = { status: "failed", error: action.payload || "Payment failed", result: null };
      })
      .addCase(submitCourseReview.pending, (state) => {
        state.reviewStatus = "loading";
        state.reviewError = "";
      })
      .addCase(submitCourseReview.fulfilled, (state, action) => {
        state.reviewStatus = "succeeded";
        state.myReviews = [action.payload, ...state.myReviews];
        state.message = "Rating submitted";
      })
      .addCase(submitCourseReview.rejected, (state, action) => {
        state.reviewStatus = "failed";
        state.reviewError = action.payload || "Could not submit rating";
      });
  },
});

export const {
  clearStudentMessage,
  resetPaymentState,
  toggleFavorite,
  enrollFree,
  markSectionComplete,
  setLastAccessed,
  saveLessonNote,
  submitRecitation,
  editMyReview,
  deleteMyReview,
} = studentSlice.actions;
export default studentSlice.reducer;
