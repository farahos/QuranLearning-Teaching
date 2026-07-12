import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../api/authApi";
import { setToken, getToken } from "../../api/client";

const USER_KEY = "qc_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

const initialState = {
  token: getToken(),
  user: readStoredUser(),
  status: "idle", // idle | loading | succeeded | failed
  bootStatus: getToken() ? "loading" : "done", // tracks the initial /users/me revalidation
  error: "",
  message: "",
};

export const loginUser = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.login(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const registerUser = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.register(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const restoreSession = createAsyncThunk("auth/restore", async (_, { rejectWithValue }) => {
  try {
    const user = await authApi.getMe();
    return user;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.updateProfile(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateTeacherProfile = createAsyncThunk("auth/updateTeacherProfile", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.updateTeacherProfile(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const changePassword = createAsyncThunk("auth/changePassword", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.changePassword(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = "";
      state.user = null;
      state.status = "idle";
      state.error = "";
      setToken("");
      persistUser(null);
    },
    clearAuthMessage(state) {
      state.message = "";
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.message = "Logged in successfully";
        setToken(action.payload.token);
        persistUser(action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.message =
          action.payload.user.role === "teacher"
            ? "Registration submitted. Your teacher account will be reviewed before you can sign in."
            : "Account created successfully";
        setToken(action.payload.token);
        persistUser(action.payload.user);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Registration failed";
      })
      .addCase(restoreSession.pending, (state) => {
        state.bootStatus = "loading";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.bootStatus = "done";
        state.user = action.payload;
        persistUser(action.payload);
      })
      .addCase(restoreSession.rejected, (state) => {
        state.bootStatus = "done";
        state.token = "";
        state.user = null;
        setToken("");
        persistUser(null);
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.message = "Profile updated";
        persistUser(action.payload);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload || "Could not update profile";
      })
      .addCase(updateTeacherProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.message = "Teacher profile updated";
        persistUser(action.payload);
      })
      .addCase(updateTeacherProfile.rejected, (state, action) => {
        state.error = action.payload || "Could not update teacher profile";
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.message = "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload || "Could not change password";
      });
  },
});

export const { logout, clearAuthMessage } = authSlice.actions;
export default authSlice.reducer;
