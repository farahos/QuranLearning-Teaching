import { api } from "./client";

export const adminApi = {
  dashboard() {
    return api.get("/admin/dashboard");
  },
  listUsers(params) {
    return api.get("/admin/users", params);
  },
  updateUser(id, payload) {
    return api.put(`/admin/users/${id}`, payload);
  },
  deleteUser(id) {
    return api.delete(`/admin/users/${id}`);
  },
  listCourses(params) {
    return api.get("/admin/courses", params);
  },
  deleteCourse(id) {
    return api.delete(`/admin/courses/${id}`);
  },
  listTransactions(params) {
    return api.get("/admin/transactions", params);
  },
  // Accepting a teacher request combines the real KYC-verify endpoint with the
  // real user-activation endpoint, both of which already exist on the backend.
  approveTeacher(teacherId) {
    return api.patch(`/kyc/verify/${teacherId}`).then(() => api.put(`/admin/users/${teacherId}`, { active: true, kycStatus: "verified" }));
  },
  // TODO(api): the backend has no reject-with-feedback endpoint; kycStatus is
  // set to "rejected" via the real update-user route, but the feedback text
  // itself has nowhere to be stored yet (see adminSlice local feedback log).
  rejectTeacher(teacherId) {
    return api.put(`/admin/users/${teacherId}`, { active: false, kycStatus: "rejected" });
  },

  // TODO(api): PATCH /api/admin/courses/:id/status — approve/reject/archive/feature
  moderateCourse() {
    return Promise.reject(new Error("Course moderation actions are not connected to the backend yet."));
  },
  // TODO(api): GET/POST/PUT/DELETE /api/categories
  listCategories() {
    return Promise.reject(new Error("Platform categories are not connected to the backend yet."));
  },
  // TODO(api): POST /api/admin/refunds/:id/approve | /reject
  reviewRefund() {
    return Promise.reject(new Error("Refund review is not connected to the backend yet."));
  },
  // TODO(api): GET /api/admin/logs
  listLogs() {
    return Promise.reject(new Error("Activity logs are not connected to the backend yet."));
  },
  // TODO(api): GET/PUT /api/admin/settings
  getSettings() {
    return Promise.reject(new Error("Platform settings are not connected to the backend yet."));
  },
  updateSettings() {
    return Promise.reject(new Error("Platform settings are not connected to the backend yet."));
  },
};
