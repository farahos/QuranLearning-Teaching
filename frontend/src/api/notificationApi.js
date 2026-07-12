// TODO(api): The backend has no /api/notifications resource yet. This entire
// feature runs on locally-generated demo notifications (see data/demoData.js
// and features/notifications/notificationSlice.js) until real endpoints exist:
//   GET /api/notifications, PATCH /api/notifications/:id/read,
//   PATCH /api/notifications/read-all, DELETE /api/notifications/:id

export const notificationApi = {
  list() {
    return Promise.reject(new Error("Notifications are not connected to the backend yet."));
  },
  markRead() {
    return Promise.reject(new Error("Notifications are not connected to the backend yet."));
  },
  markAllRead() {
    return Promise.reject(new Error("Notifications are not connected to the backend yet."));
  },
  remove() {
    return Promise.reject(new Error("Notifications are not connected to the backend yet."));
  },
};
