import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { teacherApi } from "../../api/teacherApi";
import { demoLiveSessions, demoSurveys } from "../../data/demoData";

const initialState = {
  wallet: null,
  transactions: [],
  walletStatus: "idle",
  walletError: "",

  reviews: [],
  reviewsStatus: "idle",
  reviewsError: "",
  // local-only annotations layered on top of server reviews (see TODO in api/teacherApi.js)
  replies: {}, // reviewId -> reply text
  flagged: {}, // reviewId -> true

  kycStatus: "idle",
  kycError: "",
  message: "",

  // TODO(api): demo-only until withdrawal / survey endpoints exist
  withdrawals: [],
  surveys: demoSurveys,
  liveSessions: demoLiveSessions,
};

export const fetchWallet = createAsyncThunk("teacher/fetchWallet", async (_, { rejectWithValue }) => {
  try {
    return await teacherApi.walletDashboard();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const submitTeacherKyc = createAsyncThunk("teacher/submitKyc", async (payload, { rejectWithValue }) => {
  try {
    return await teacherApi.submitKyc(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchTeacherReviews = createAsyncThunk("teacher/fetchReviews", async (teacherId, { rejectWithValue }) => {
  try {
    return await teacherApi.listReviews(teacherId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

let withdrawalId = 1;

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    clearTeacherMessage(state) {
      state.message = "";
      state.walletError = "";
      state.kycError = "";
      state.reviewsError = "";
    },
    requestWithdrawal(state, action) {
      state.withdrawals = [
        { id: `wd-local-${withdrawalId++}`, status: "pending", requestedAt: new Date().toISOString(), ...action.payload },
        ...state.withdrawals,
      ];
      state.message = "Withdrawal requested (demo only — not connected to the backend yet)";
    },
    replyToReview(state, action) {
      const { reviewId, reply } = action.payload;
      state.replies[reviewId] = reply;
      state.message = "Reply saved locally (demo only — not connected to the backend yet)";
    },
    toggleFlagReview(state, action) {
      const reviewId = action.payload;
      state.flagged[reviewId] = !state.flagged[reviewId];
    },
    createSurvey(state, action) {
      state.surveys = [{ id: `survey-local-${Date.now()}`, status: "published", responses: 0, ...action.payload }, ...state.surveys];
      state.message = "Survey created (demo only — not connected to the backend yet)";
    },
    closeSurvey(state, action) {
      state.surveys = state.surveys.map((survey) => (survey.id === action.payload ? { ...survey, status: "closed" } : survey));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.walletStatus = "loading";
        state.walletError = "";
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.walletStatus = "succeeded";
        state.wallet = action.payload.wallet;
        state.transactions = action.payload.transactions || [];
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.walletStatus = "failed";
        state.walletError = action.payload || "Could not load wallet";
      })
      .addCase(submitTeacherKyc.pending, (state) => {
        state.kycStatus = "loading";
        state.kycError = "";
      })
      .addCase(submitTeacherKyc.fulfilled, (state) => {
        state.kycStatus = "succeeded";
        state.message = "KYC documents submitted for review";
      })
      .addCase(submitTeacherKyc.rejected, (state, action) => {
        state.kycStatus = "failed";
        state.kycError = action.payload || "Could not submit KYC";
      })
      .addCase(fetchTeacherReviews.pending, (state) => {
        state.reviewsStatus = "loading";
        state.reviewsError = "";
      })
      .addCase(fetchTeacherReviews.fulfilled, (state, action) => {
        state.reviewsStatus = "succeeded";
        state.reviews = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTeacherReviews.rejected, (state, action) => {
        state.reviewsStatus = "failed";
        state.reviewsError = action.payload || "Could not load reviews";
      });
  },
});

export const { clearTeacherMessage, requestWithdrawal, replyToReview, toggleFlagReview, createSurvey, closeSurvey } = teacherSlice.actions;
export default teacherSlice.reducer;
