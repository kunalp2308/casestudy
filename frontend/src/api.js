const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "access_token";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getLoginUrl() {
  return `${API_BASE_URL}/auth/google/login`;
}

async function request(path, options = {}) {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = payload?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : detail || "Request failed";
    throw new Error(message);
  }

  return payload;
}

export const api = {
  auth: {
    me: () => request("/auth/me"),
  },
  users: {
    list: () => request("/users"),
    create: (payload) =>
      request("/users", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id) => request(`/users/${id}`, { method: "DELETE" }),
  },
  roles: {
    list: () => request("/roles"),
    create: (payload) =>
      request("/roles", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request(`/roles/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id) => request(`/roles/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: () => request("/projects"),
    create: (payload) =>
      request("/projects", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/projects/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: () => request("/tasks"),
    create: (payload) =>
      request("/tasks", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
    complete: (id) => request(`/tasks/${id}/complete`, { method: "PATCH" }),
  },
};
