const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
const MEDIA_BASE = API_BASE.replace(/\/api\/?$/, "");
const TOKEN_KEY = "qc_token";

let unauthorizedHandler = null;

export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, params, skipAuth = false } = {}) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    });
  }

  const token = skipAuth ? "" : getToken();
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    const error = new Error("Cannot reach the server. Check your connection and try again.");
    error.cause = networkError;
    throw error;
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (response.status === 401 && !skipAuth) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    const validationMessage = Array.isArray(data?.errors) ? data.errors[0]?.msg : null;
    const message = data?.message || validationMessage || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  mediaUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${MEDIA_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  },
  get(path, params) {
    return request(path, { params });
  },
  post(path, body, options) {
    return request(path, { method: "POST", body, ...options });
  },
  put(path, body, options) {
    return request(path, { method: "PUT", body, ...options });
  },
  patch(path, body, options) {
    return request(path, { method: "PATCH", body, ...options });
  },
  delete(path, options) {
    return request(path, { method: "DELETE", ...options });
  },
};

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.slice(result.indexOf(",") + 1);
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}
