import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { categoryApi } from "../../api/categoryApi";
import { demoCategories } from "../../data/demoData";

const initialState = {
  items: demoCategories,
  status: "idle",
  saveStatus: "idle",
  isDemo: false,
  error: "",
  message: "",
};

export const fetchCategories = createAsyncThunk("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await categoryApi.list();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addCategory = createAsyncThunk("categories/create", async (payload, { rejectWithValue }) => {
  try {
    return await categoryApi.create(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateCategory = createAsyncThunk("categories/update", async ({ id, updates }, { rejectWithValue }) => {
  try {
    return await categoryApi.update(id, updates);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const removeCategory = createAsyncThunk("categories/delete", async (id, { rejectWithValue }) => {
  try {
    await categoryApi.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const toggleCategoryActive = createAsyncThunk("categories/toggleActive", async (category, { rejectWithValue }) => {
  try {
    return await categoryApi.update(category.id, { active: !category.active });
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoryMessage(state) {
      state.message = "";
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.isDemo = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Could not load categories";
      })
      .addCase(addCategory.pending, setSaving)
      .addCase(addCategory.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = [action.payload, ...state.items];
        state.message = "Category saved";
      })
      .addCase(addCategory.rejected, setSaveError("Could not save category"))
      .addCase(updateCategory.pending, setSaving)
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
        state.message = "Category updated";
      })
      .addCase(updateCategory.rejected, setSaveError("Could not update category"))
      .addCase(removeCategory.pending, setSaving)
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.message = "Category deleted";
      })
      .addCase(removeCategory.rejected, setSaveError("Could not delete category"))
      .addCase(toggleCategoryActive.pending, setSaving)
      .addCase(toggleCategoryActive.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
        state.message = action.payload.active ? "Category activated" : "Category deactivated";
      })
      .addCase(toggleCategoryActive.rejected, setSaveError("Could not update category"));
  },
});

function setSaving(state) {
  state.saveStatus = "loading";
  state.error = "";
}

function setSaveError(fallback) {
  return (state, action) => {
    state.saveStatus = "failed";
    state.error = action.payload || fallback;
  };
}

export const { clearCategoryMessage } = categorySlice.actions;
export default categorySlice.reducer;
