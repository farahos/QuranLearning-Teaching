import { api } from "./client";

export const categoryApi = {
  list() {
    return api.get("/categories");
  },
  create(payload) {
    return api.post("/categories", payload);
  },
  update(id, payload) {
    return api.put(`/categories/${id}`, payload);
  },
  remove(id) {
    return api.delete(`/categories/${id}`);
  },
};
