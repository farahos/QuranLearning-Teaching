import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notificationApi } from "../../api/notificationApi";

const initialState = {
  items: [],
  status: "idle",
  error: "",
};

export const fetchNotifications = createAsyncThunk("notifications/fetch", async (_, { rejectWithValue }) => {
  try {
    return await notificationApi.list();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const markNotificationRead = createAsyncThunk("notifications/markRead", async (id, { rejectWithValue }) => {
  try {
    return await notificationApi.markRead(id);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const markAllNotificationsRead = createAsyncThunk("notifications/markAllRead", async (_, { rejectWithValue }) => {
  try {
    await notificationApi.markAllRead();
    return true;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const removeNotification = createAsyncThunk("notifications/remove", async (id, { rejectWithValue }) => {
  try {
    await notificationApi.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Could not load notifications";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, read: true }));
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default notificationSlice.reducer;
