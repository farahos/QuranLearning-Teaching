// TODO(api): The backend has no /api/categories resource yet. Course "category"
// is currently just a free-text field on the Course model. Once a real Category
// model/route exists, replace the rejected promises below with real api.* calls
// (GET/POST/PUT/DELETE /api/categories) and drop the local-only reducers in
// features/categories/categorySlice.js that back this UI today.

export const categoryApi = {
  list() {
    return Promise.reject(new Error("Categories are not connected to the backend yet."));
  },
  create() {
    return Promise.reject(new Error("Categories are not connected to the backend yet."));
  },
  update() {
    return Promise.reject(new Error("Categories are not connected to the backend yet."));
  },
  remove() {
    return Promise.reject(new Error("Categories are not connected to the backend yet."));
  },
};
