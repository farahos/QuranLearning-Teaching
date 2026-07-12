import { configureStore } from "@reduxjs/toolkit";
import portalReducer from "./portalSlice";

export const store = configureStore({
  reducer: {
    portal: portalReducer,
  },
});
