import { createSlice } from "@reduxjs/toolkit";
import { demoNotifications } from "../../data/demoData";

// TODO(api): GET/PATCH/DELETE /api/notifications do not exist yet — this runs
// entirely on local demo data (see data/demoData.js) until they do.
const initialState = {
  items: demoNotifications,
  isDemo: true,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markNotificationRead(state, action) {
      state.items = state.items.map((item) => (item.id === action.payload ? { ...item, read: true } : item));
    },
    markAllNotificationsRead(state) {
      state.items = state.items.map((item) => ({ ...item, read: true }));
    },
    removeNotification(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { markNotificationRead, markAllNotificationsRead, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
