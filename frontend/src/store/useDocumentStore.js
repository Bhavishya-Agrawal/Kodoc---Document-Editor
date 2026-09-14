import { create } from "zustand";
import api from "@/utils/api";

export const useDocumentStore = create((set) => ({
  documents: [],
  loading: false,
  error: null,
  stats: null,

  loadDocuments: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/api/documents");
      
      set({
        documents: res.data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to load documents",
        loading: false,
      });
    }
  },

  fetchStats: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/api/stats");

      set({ stats: res.data });
    } catch (err) {
      // Stats are non-critical — don't block the UI
      console.error("Failed to fetch stats:", err);
    }
  },

  createDocument: async (title) => {
    try {
      set({ loading: true, error: null });
      
      const res = await api.post("/api/documents", { title });
      
      const newDoc = res.data.document || res.data;

      set((state) => ({
        documents: [newDoc, ...state.documents],
        loading: false,
      }));

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to create document",
        loading: false,
      });
      throw err;
    }
  },

  toggleStarDocument: async (documentId) => {
    try {
      // Optimistic update
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc._id === documentId || doc.id === documentId
            ? { ...doc, isStarred: !doc.isStarred }
            : doc
        ),
      }));

      await api.patch(`/api/documents/${documentId}/star`);
    } catch (err) {
      console.error("Failed to toggle star", err);
      // Revert on error
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc._id === documentId || doc.id === documentId
            ? { ...doc, isStarred: !doc.isStarred }
            : doc
        ),
      }));
    }
  },

  duplicateDocument: async (documentId) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post(`/api/documents/${documentId}/duplicate`);

      const newDoc = res.data.document;

      set((state) => ({
        documents: [newDoc, ...state.documents],
        loading: false,
      }));

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to duplicate document",
        loading: false,
      });
      throw err;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      set({ loading: true, error: null });

      await api.delete(`/api/documents/${documentId}`);

      set((state) => ({
        documents: state.documents.filter(doc => doc._id !== documentId && doc.id !== documentId),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to delete document",
        loading: false,
      });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));