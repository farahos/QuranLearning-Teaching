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
  async uploadDocument(file) {
    const data = await fileToBase64(file);
    return api.post("/uploads/document", { fileName: file.name, data });
  },
};
