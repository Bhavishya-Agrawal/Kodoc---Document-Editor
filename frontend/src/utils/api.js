import axios from "axios";

/**
 * Centralized Axios instance for all API calls.
 * 
 * Base URL resolution:
 *  - If VITE_BACKEND_URL is set (e.g. "https://my-backend.onrender.com"), use it.
 *  - If running on Vercel (same domain), use "" so requests go to /api/... on the same origin.
 *  - In local development, default to http://localhost:5000.
 */
const resolveBaseURL = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;

  // If explicitly set in .env, always use it
  if (envUrl) return envUrl;

  // In production (Vercel same-origin deployment), use empty string
  // so requests are relative: "/api/documents" -> same domain
  if (import.meta.env.PROD) return "";

  // Local development fallback
  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: resolveBaseURL(),
});

// Attach auth token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
