import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired / revoked token on a protected call -> back to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/** Turn any API/network error into a readable message. */
export function errMsg(err) {
  if (!err.response) return "Cannot reach the server. Is the backend running?";
  const d = err.response.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => `${x.loc?.slice(-1)[0] ?? "field"}: ${x.msg.replace("Value error, ", "")}`).join("; ");
  return "Something went wrong. Please try again.";
}

export default api;
