import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { courseApi } from "../../api/courseApi";
import { getId, withCourseExtras } from "../../utils/courseUtils";

const initialState = {
  items: [],
  selected: null,
  status: "idle", // list fetch: idle | loading | succeeded | failed
  saveStatus: "idle", // create/update/delete: idle | loading | succeeded | failed
  error: "",
  message: "",
  filters: { search: "", category: "", status: "", level: "", priceType: "" },
  studentsByCourse: [],
  studentsStatus: "idle",
};

export const fetchCourses = createAsyncThunk("courses/fetchAll", async (params, { rejectWithValue }) => {
  try {
    return await courseApi.list(params);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchCourseById = createAsyncThunk("courses/fetchOne", async (id, { rejectWithValue }) => {
  try {
    return await courseApi.get(id);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createCourse = createAsyncThunk("courses/create", async (payload, { rejectWithValue }) => {
  try {
    return await courseApi.create(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateCourseThunk = createAsyncThunk("courses/update", async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await courseApi.update(id, payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteCourseThunk = createAsyncThunk("courses/delete", async (id, { rejectWithValue }) => {
  try {
    await courseApi.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchTeacherStudents = createAsyncThunk("courses/teacherStudents", async (_, { rejectWithValue }) => {
  try {
    return await courseApi.teacherStudents();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

function mergeWithExisting(existingItems, incoming, index) {
  const existing = existingItems.find((item) => item._id === getId(incoming));
  return existing ? { ...existing, ...incoming, _id: getId(incoming) } : withCourseExtras(incoming, index);
}

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourseFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetCourseFilters(state) {
      state.filters = initialState.filters;
    },
    clearCourseMessage(state) {
      state.message = "";
      state.error = "";
    },
    // Local-only edits for fields the backend doesn't persist yet (playlists,
    // sections, materials, certificate rules, draft/published/archived status,
    // featured flag). See utils/courseUtils.js withCourseExtras() for context.
    updateCourseLocal(state, action) {
      const { id, updates } = action.payload;
      state.items = state.items.map((item) => (item._id === id ? { ...item, ...updates } : item));
      if (state.selected?._id === id) state.selected = { ...state.selected, ...updates };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        const list = Array.isArray(action.payload) ? action.payload : [];
        state.items = list.map((course, index) => mergeWithExisting(state.items, course, index));
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Could not load courses";
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.selected = mergeWithExisting(state.items, action.payload, 0);
      })
      .addCase(createCourse.pending, (state) => {
        state.saveStatus = "loading";
        state.error = "";
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        const submitted = action.meta.arg;
        const saved = action.payload;
        const merged = withCourseExtras({ ...submitted, ...saved, _id: getId(saved) }, state.items.length);
        state.items = [merged, ...state.items];
        state.message = "Course created";
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.payload || "Could not create course";
      })
      .addCase(updateCourseThunk.pending, (state) => {
        state.saveStatus = "loading";
        state.error = "";
      })
      .addCase(updateCourseThunk.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        const { id, payload: submitted } = action.meta.arg;
        const saved = action.payload;
        state.items = state.items.map((item) => (item._id === id ? { ...item, ...submitted, ...saved } : item));
        if (state.selected?._id === id) state.selected = { ...state.selected, ...submitted, ...saved };
        state.message = "Course updated";
      })
      .addCase(updateCourseThunk.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.payload || "Could not update course";
      })
      .addCase(deleteCourseThunk.pending, (state) => {
        state.saveStatus = "loading";
        state.error = "";
      })
      .addCase(deleteCourseThunk.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.message = "Course deleted";
      })
      .addCase(deleteCourseThunk.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.payload || "Could not delete course";
      })
      .addCase(fetchTeacherStudents.pending, (state) => {
        state.studentsStatus = "loading";
      })
      .addCase(fetchTeacherStudents.fulfilled, (state, action) => {
        state.studentsStatus = "succeeded";
        state.studentsByCourse = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTeacherStudents.rejected, (state, action) => {
        state.studentsStatus = "failed";
        state.error = action.payload || "Could not load students";
      });
  },
});

export const { setCourseFilters, resetCourseFilters, clearCourseMessage, updateCourseLocal } = courseSlice.actions;
export default courseSlice.reducer;
