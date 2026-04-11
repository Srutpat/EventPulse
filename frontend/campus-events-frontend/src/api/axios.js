import axios from "axios";

// In development: http://localhost:8081
// In production:  set VITE_API_URL in your Vercel/Netlify environment variables
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach user id to every request header
api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) config.headers["X-User-Id"] = user.id;
  } catch (_) {}
  return config;
});

export default api;