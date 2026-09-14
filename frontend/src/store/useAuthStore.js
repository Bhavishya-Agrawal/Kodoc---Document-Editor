import { create } from "zustand";
import api from "@/utils/api";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: Boolean(localStorage.getItem("token")),
  loading: false,
  error: null,
  signup: async (userData) => {
    try {
      set({ loading: true, error: null });
      const res = await api.post("/api/auth/signup", userData);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Signup failed";
      set({
        error: errorMessage,
        loading: false,
        user: null,
        token: null,
        isAuthenticated: false,
      });
      throw new Error(errorMessage);
    }
  },
  signin: async (userData) => {
    try {
      set({ loading: true, error: null });
      const res = await api.post("/api/auth/signin", userData);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Signin failed";
      set({
        error: errorMessage,
        loading: false,
        user: null,
        token: null,
        isAuthenticated: false,
      });
      throw new Error(errorMessage);
    }
  },
  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
}));
