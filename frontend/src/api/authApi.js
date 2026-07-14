import { api } from "./client";

export const authApi = {
  login(payload) {
    return api.post("/auth/login", { ...payload, platform: "web" }, { skipAuth: true });
  },
  register(payload) {
    return api.post("/auth/register", payload, { skipAuth: true });
  },
  getMe() {
    return api.get("/users/me");
  },
  updateProfile(payload) {
    return api.put("/users/me", payload);
  },
  changePassword(payload) {
    return api.put("/users/me/password", payload);
  },
  updateTeacherProfile(payload) {
    return api.put("/users/teacher/profile", payload);
  },
};
