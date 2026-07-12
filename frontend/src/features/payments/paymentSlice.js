import { createSlice } from "@reduxjs/toolkit";
import { demoRefunds } from "../../data/demoData";

// TODO(api): the backend Transaction model has no "refund" type and there is
// no POST /api/admin/refunds/:id/approve|reject route yet. Everything here is
// local-only; refund status never advances past a demo state, and the UI
// never claims money actually moved (see rules in adminApi.js reviewRefund()).
const initialState = {
  refunds: demoRefunds,
  isDemo: true,
  message: "",
};

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    requestRefund(state, action) {
      state.refunds = [{ id: `refund-local-${Date.now()}`, status: "pending", requestedAt: new Date().toISOString().slice(0, 10), ...action.payload }, ...state.refunds];
      state.message = "Refund requested (demo only — not connected to the backend yet)";
    },
    approveRefund(state, action) {
      const { id, note } = action.payload;
      state.refunds = state.refunds.map((refund) => (refund.id === id ? { ...refund, status: "approved_demo", adminNote: note } : refund));
      state.message = "Refund marked approved in this demo — no funds were actually moved";
    },
    rejectRefund(state, action) {
      const { id, note } = action.payload;
      state.refunds = state.refunds.map((refund) => (refund.id === id ? { ...refund, status: "rejected", adminNote: note } : refund));
      state.message = "Refund rejected";
    },
    clearPaymentMessage(state) {
      state.message = "";
    },
  },
});

export const { requestRefund, approveRefund, rejectRefund, clearPaymentMessage } = paymentSlice.actions;
export default paymentSlice.reducer;
