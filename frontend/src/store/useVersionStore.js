import { create } from "zustand";
import api from "@/utils/api";

export const useVersionStore = create((set) => ({
  versions: [],
  currentDocument: null,
  currentContent: "",
  previewVersionId: null,
  loading: false,
  saving: false,
  error: null,
  saveInfo: null,

  loadDocumentAndVersions: async (docId) => {
    try {
      set({ loading: true, error: null });

      // 1. Fetch document and current content
      const docRes = await api.get(`/api/documents/${docId}`);
      
      // 2. Fetch all versions
      const versionsRes = await api.get(`/api/documents/${docId}/versions`);

      set({
        currentDocument: docRes.data.document,
        currentContent: docRes.data.content,
        previewVersionId: null,
        versions: versionsRes.data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to load document",
        loading: false,
      });
    }
  },

  saveNewVersion: async (docId, content, commitMessageInput) => {
    try {
      set({ saving: true, error: null });
      const latestVersion = useVersionStore.getState().versions[0];
      const commitMessage = (commitMessageInput || "").trim() || `Save ${new Date().toLocaleString()}`;

      const res = await api.post(`/api/documents/${docId}/versions`, { content, commitMessage });

      if (res.data.saved === false) {
        set({
          saving: false,
          currentContent: latestVersion?.content ?? content,
        });
        return { saved: false, message: res.data.message };
      }

      const newVersion = res.data.version || res.data;

      set((state) => ({
        versions: [newVersion, ...state.versions], // Backend sorts newest first, we add to top
        currentContent: content,
        previewVersionId: null,
        currentDocument: { ...state.currentDocument, currentVersion: newVersion.versionNumber },
        saveInfo: null,
        saving: false,
      }));
      return { saved: true, version: newVersion };
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to save version",
        saving: false,
      });
      throw err;
    }
  },

  restoreVersion: async (docId, versionId, customCommitMessage) => {
    try {
      set({ saving: true, error: null });
      const targetVersion = useVersionStore.getState().versions.find(
        (v) => v._id === versionId || v.id === versionId
      );
      const commitMessage =
        (customCommitMessage || "").trim() ||
        (targetVersion
          ? `Rollback to v${targetVersion.versionNumber}`
          : `Restore ${new Date().toLocaleString()}`);

      const res = await api.post(`/api/documents/${docId}/versions/${versionId}/restore`, { commitMessage });

      if (res.data.saved === false) {
        set({
          saving: false,
          previewVersionId: null,
        });
        return { saved: false, message: res.data.message };
      }

      const restoredVersion = res.data.version;

      set((state) => ({
        versions: [restoredVersion, ...state.versions],
        currentContent: restoredVersion.content,
        previewVersionId: null,
        currentDocument: { ...state.currentDocument, currentVersion: restoredVersion.versionNumber },
        saveInfo: null,
        saving: false,
      }));
      return { saved: true, version: restoredVersion };
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to restore version",
        saving: false,
      });
      throw err;
    }
  },

  getVersionById: (versionId) => {
    return useVersionStore.getState().versions.find(
      (v) => v._id === versionId || v.id === versionId
    );
  },

  setPreviewVersion: (versionId, content) => {
    set({ previewVersionId: versionId, currentContent: content });
  },

  renameDocument: async (docId, newTitle) => {
    try {
      await api.put(`/api/documents/${docId}`, { title: newTitle });
      set((state) => ({
        currentDocument: { ...state.currentDocument, title: newTitle }
      }));
    } catch (err) {
      console.error("Failed to rename document", err);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearSaveInfo: () => {
    set({ saveInfo: null });
  },
}));
