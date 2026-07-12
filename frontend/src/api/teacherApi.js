import { api } from "./client";

export const teacherApi = {
  walletDashboard() {
    return api.get("/wallet");
  },
  submitKyc(payload) {
    return api.post("/kyc/submit", payload);
  },
  listReviews(teacherId) {
    return api.get(`/reviews/teacher/${teacherId}`);
  },

  // TODO(api): POST /api/wallet/withdraw — teacher withdrawal requests are not
  // implemented on the backend yet. Requests are tracked locally (see teacherSlice).
  requestWithdrawal() {
    return Promise.reject(new Error("Withdrawal requests are not connected to the backend yet."));
  },
  // TODO(api): POST /api/courses/:id/reply — replying to student feedback has no endpoint yet.
  replyToReview() {
    return Promise.reject(new Error("Replying to feedback is not connected to the backend yet."));
  },
  // TODO(api): POST /api/surveys — feedback survey creator has no endpoint yet.
  createSurvey() {
    return Promise.reject(new Error("Survey publishing is not connected to the backend yet."));
  },
};
