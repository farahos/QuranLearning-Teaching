const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
const MEDIA_BASE = API_BASE.replace(/\/api$/, "");

async function request(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
}

export const api = {
  mediaUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${MEDIA_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  },
  get(path, token) {
    return request(path, { token });
  },
  post(path, body, token) {
    return request(path, { method: "POST", body, token });
  },
  put(path, body, token) {
    return request(path, { method: "PUT", body, token });
  },
  delete(path, token) {
    return request(path, { method: "DELETE", token });
  },
};
