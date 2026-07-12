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
  // TODO(api): GET/POST/DELETE /api/favorites
  listFavorites() {
    return Promise.reject(new Error("Favorites are not connected to the backend yet."));
  },
  // TODO(api): GET /api/progress, POST /api/progress/:lessonId/complete
  listProgress() {
    return Promise.reject(new Error("Progress tracking is not connected to the backend yet."));
  },
  // TODO(api): GET /api/certificates
  listCertificates() {
    return Promise.reject(new Error("Certificates are not connected to the backend yet."));
  },
  // TODO(api): GET/PATCH/DELETE /api/notifications
  listNotifications() {
    return Promise.reject(new Error("Notifications are not connected to the backend yet."));
  },
  // TODO(api): POST /api/recitations — Quran recitation task submissions
  submitRecitation() {
    return Promise.reject(new Error("Recitation submissions are not connected to the backend yet."));
  },
};
