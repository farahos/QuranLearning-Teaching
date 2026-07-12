import { api } from "./client";

export const paymentApi = {
  // Real: the only payment rail the backend implements is Waafi-style mobile
  // money via /api/wallet/pay-course (EVC Plus / Zaad / Sahal).
  payCourse(payload) {
    return api.post("/wallet/pay-course", payload);
  },
  walletDashboard() {
    return api.get("/wallet");
  },

  // TODO(api): POST /api/wallet/withdraw
  requestWithdrawal() {
    return Promise.reject(new Error("Withdrawal requests are not connected to the backend yet."));
  },
  // TODO(api): GET /api/admin/payments (richer filtering than /admin/transactions)
  listPayments() {
    return Promise.reject(new Error("Payment reports are not connected to the backend yet."));
  },
  // TODO(api): GET /api/admin/refunds, POST /api/admin/refunds/:id/approve|reject
  listRefunds() {
    return Promise.reject(new Error("Refunds are not connected to the backend yet."));
  },
};
