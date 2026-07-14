import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { studentApi } from "../../api/studentApi";
import { getId } from "../../utils/courseUtils";

const initialState = {
  favorites: [],
  favoritesStatus: "idle",
  // shape: { [courseId]: { completedSectionIds: string[], lastAccessedSectionId, notes: {}, updatedAt } }
  // completedSectionIds/lastAccessedSectionId are persisted via GET/PUT /api/progress/:courseId
  // (a lesson's id doubles as its "section" id — see courseUtils.lessonsToPlaylist). `notes` stays
  // local-only; the backend Progress model has no field for it yet.
  progress: {},
  certificates: [],
  certificatesStatus: "idle",
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

export const fetchFavorites = createAsyncThunk("student/fetchFavorites", async (_, { rejectWithValue }) => {
  try {
    return await studentApi.listFavorites();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const toggleFavoriteThunk = createAsyncThunk("student/toggleFavorite", async (courseId, { getState, rejectWithValue }) => {
  try {
    const isFavorite = getState().student.favorites.includes(courseId);
    if (isFavorite) {
      await studentApi.removeFavorite(courseId);
      return { courseId, favorited: false };
    }
    await studentApi.addFavorite(courseId);
    return { courseId, favorited: true };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchProgress = createAsyncThunk("student/fetchProgress", async (courseId, { rejectWithValue }) => {
  try {
    const data = await studentApi.getProgress(courseId);
    return { courseId, data };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchProgressForCourses = createAsyncThunk(
  "student/fetchProgressForCourses",
  async (courseIds, { rejectWithValue }) => {
    try {
      const entries = await Promise.all(
        courseIds.map(async (courseId) => [courseId, await studentApi.getProgress(courseId)])
      );
      return entries;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeLesson = createAsyncThunk(
  "student/completeLesson",
  async ({ courseId, lessonId, completed = true }, { rejectWithValue }) => {
    try {
      const data = await studentApi.updateProgress(courseId, { lessonId, completed });
      return { courseId, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCertificates = createAsyncThunk("student/fetchCertificates", async (_, { rejectWithValue }) => {
  try {
    return await studentApi.listCertificates();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    hydrateStudentState(state, action) {
      const { progress, favorites, freeEnrollments, recitations, myReviews } = action.payload || {};
      if (progress) state.progress = progress;
      if (favorites) state.favorites = favorites;
      if (freeEnrollments) state.freeEnrollments = freeEnrollments;
      if (recitations) state.recitations = recitations;
      if (myReviews) state.myReviews = myReviews;
    },
    clearStudentMessage(state) {
      state.message = "";
      state.error = "";
    },
    resetPaymentState(state) {
      state.payment = { status: "idle", error: "", result: null };
    },
    enrollFree(state, action) {
      const courseId = action.payload;
      if (!state.freeEnrollments.includes(courseId)) state.freeEnrollments.push(courseId);
      state.message = "Enrolled (demo only — free enrollment is not connected to the backend yet)";
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
      })
      .addCase(fetchFavorites.pending, (state) => {
        state.favoritesStatus = "loading";
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favoritesStatus = "succeeded";
        state.favorites = (action.payload || []).map((course) => getId(course));
      })
      .addCase(fetchFavorites.rejected, (state) => {
        state.favoritesStatus = "failed";
      })
      .addCase(toggleFavoriteThunk.fulfilled, (state, action) => {
        const { courseId, favorited } = action.payload;
        state.favorites = favorited ? [...state.favorites, courseId] : state.favorites.filter((id) => id !== courseId);
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        applyProgress(state, action.payload.courseId, action.payload.data);
      })
      .addCase(fetchProgressForCourses.fulfilled, (state, action) => {
        action.payload.forEach(([courseId, data]) => applyProgress(state, courseId, data));
      })
      .addCase(completeLesson.fulfilled, (state, action) => {
        applyProgress(state, action.payload.courseId, action.payload.data);
      })
      .addCase(fetchCertificates.pending, (state) => {
        state.certificatesStatus = "loading";
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.certificatesStatus = "succeeded";
        state.certificates = action.payload || [];
      })
      .addCase(fetchCertificates.rejected, (state) => {
        state.certificatesStatus = "failed";
      });
  },
});

function applyProgress(state, courseId, data) {
  const existing = state.progress[courseId] || { completedSectionIds: [], notes: {} };
  state.progress[courseId] = {
    completedSectionIds: data?.completedLessonIds || [],
    lastAccessedSectionId: data?.lastAccessedLessonId || "",
    notes: existing.notes || {},
    updatedAt: data?.updatedAt || existing.updatedAt,
  };
}

export const {
  hydrateStudentState,
  clearStudentMessage,
  resetPaymentState,
  enrollFree,
  saveLessonNote,
  submitRecitation,
  editMyReview,
  deleteMyReview,
} = studentSlice.actions;
export default studentSlice.reducer;
