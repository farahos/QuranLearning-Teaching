import { createSlice } from "@reduxjs/toolkit";
import { demoCategories } from "../../data/demoData";

// TODO(api): backed entirely by local state until GET/POST/PUT/DELETE
// /api/categories exist (see api/categoryApi.js). isDemo stays true so pages
// can show a "not saved to server" indicator instead of pretending success.
const initialState = {
  items: demoCategories,
  isDemo: true,
  message: "",
};

let localId = demoCategories.length + 1;

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategory(state, action) {
      state.items = [{ id: `cat-local-${localId++}`, courseCount: 0, active: true, ...action.payload }, ...state.items];
      state.message = "Category added (demo only — not saved to the server yet)";
    },
    updateCategory(state, action) {
      const { id, updates } = action.payload;
      state.items = state.items.map((item) => (item.id === id ? { ...item, ...updates } : item));
      state.message = "Category updated (demo only — not saved to the server yet)";
    },
    removeCategory(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.message = "Category removed (demo only — not saved to the server yet)";
    },
    toggleCategoryActive(state, action) {
      state.items = state.items.map((item) => (item.id === action.payload ? { ...item, active: !item.active } : item));
    },
    clearCategoryMessage(state) {
      state.message = "";
    },
  },
});

export const { addCategory, updateCategory, removeCategory, toggleCategoryActive, clearCategoryMessage } = categorySlice.actions;
export default categorySlice.reducer;
