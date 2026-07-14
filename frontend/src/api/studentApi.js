import { api } from "./client";

export const studentApi = {
  payCourse(payload) {
    return api.post("/wallet/pay-course", payload);
  },
  submitReview(payload) {
    return api.post("/reviews", payload);
  },

  // TODO(api): POST /api/enrollments — free-course enrollment has no dedicated
  // endpoint yet (only paid Waafi purchases via /wallet/pay-course exist).
  enrollFree() {
    return Promise.reject(new Error("Free enrollment is not connected to the backend yet."));
  },
  listFavorites() {
    return api.get("/users/me/favorites");
  },
  addFavorite(courseId) {
    return api.post(`/users/me/favorites/${courseId}`, {});
  },
  removeFavorite(courseId) {
    return api.delete(`/users/me/favorites/${courseId}`);
  },
  getProgress(courseId) {
    return api.get(`/progress/${courseId}`);
  },
  updateProgress(courseId, payload) {
    return api.put(`/progress/${courseId}`, payload);
  },
  listCertificates() {
    return api.get("/certificates");
  },
  // TODO(api): POST /api/recitations — Quran recitation task submissions
  submitRecitation() {
    return Promise.reject(new Error("Recitation submissions are not connected to the backend yet."));
  },
};
