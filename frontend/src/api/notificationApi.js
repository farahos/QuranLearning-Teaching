import { api } from "./client";

export const notificationApi = {
  list() {
    return api.get("/notifications");
  },
  markRead(id) {
    return api.patch(`/notifications/${id}/read`, {});
  },
  markAllRead() {
    return api.patch("/notifications/read-all", {});
  },
  remove(id) {
    return api.delete(`/notifications/${id}`);
  },
};
