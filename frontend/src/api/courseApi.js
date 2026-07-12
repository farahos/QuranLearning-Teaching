import { api } from "./client";

export const courseApi = {
  list(params) {
    return api.get("/courses", params);
  },
  get(id) {
    return api.get(`/courses/${id}`);
  },
  create(payload) {
    return api.post("/courses", payload);
  },
  update(id, payload) {
    return api.put(`/courses/${id}`, payload);
  },
  remove(id) {
    return api.delete(`/courses/${id}`);
  },
  teacherStudents() {
    return api.get("/courses/teacher/students");
  },
};
