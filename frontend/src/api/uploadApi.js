import { api, fileToBase64 } from "./client";

export const uploadApi = {
  async uploadImage(file) {
    const data = await fileToBase64(file);
    return api.post("/uploads/image", { fileName: file.name, data });
  },
  async uploadVideo(file) {
    const data = await fileToBase64(file);
    return api.post("/uploads/video", { fileName: file.name, data });
  },
  // TODO(api): the backend's /api/uploads routes only accept image/video
  // extensions (see backend/src/routes/uploadRoutes.js). There is no endpoint
  // for PDF/PowerPoint course materials yet, so material uploads fall back to
  // a manual "file URL" text field until POST /api/uploads/document exists.
  uploadDocument() {
    return Promise.reject(new Error("Document upload is not connected to the backend yet. Paste a file URL instead."));
  },
};
