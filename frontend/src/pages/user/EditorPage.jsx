import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVersionStore } from "@/store/useVersionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ToastProvider";
import VersionSidebar from "@/components/VersionSidebar";
import TextEditor from "@/components/TextEditor";
import DiffViewerModal from "@/components/DiffViewerModal";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Save,
  Download,
  GitCompare,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileText,
  Printer,
  ChevronDown,
} from "lucide-react";
import {
  exportAsMarkdown,
  exportAsHtml,
  exportAsPlainText,
  printDocument,
} from "@/utils/exportDocument";

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();
  const {
    currentDocument,
    currentContent,
    versions,
    loadDocumentAndVersions,
    saveNewVersion,
    restoreVersion,
    previewVersionId,
    loading,
    saving,
    error,
    renameDocument,
  } = useVersionStore();

  const [localContent, setLocalContent] = useState("");
  const [localTitle, setLocalTitle] = useState("");
  const [commitMessage, setCommitMessage] = useState("");

  // Export menu open state
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  // Diff Modal states
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [diffBaseVersion, setDiffBaseVersion] = useState(null);
  const [diffTargetVersion, setDiffTargetVersion] = useState(null);

  // Derive word & character counts directly from localContent (idiomatic React)
  const { wordCount, charCount } = useMemo(() => {
    if (!localContent) return { wordCount: 0, charCount: 0 };
    const temp = document.createElement("div");
    temp.innerHTML = localContent;
    const text = (temp.textContent || temp.innerText || "").trim();
    const words = text ? text.split(/\s+/).filter(Boolean) : [];
    return { wordCount: words.length, charCount: text.length };
  }, [localContent]);

  // Synchronize localContent when currentContent changes (e.g., version restore or load)
  const [prevContent, setPrevContent] = useState(currentContent);
  if (currentContent !== prevContent) {
    setPrevContent(currentContent);
    setLocalContent(currentContent || "");
  }

  // Synchronize localTitle when currentDocument changes
  const [prevDocTitle, setPrevDocTitle] = useState(currentDocument?.title);
  if (currentDocument?.title && currentDocument.title !== prevDocTitle) {
    setPrevDocTitle(currentDocument.title);
    setLocalTitle(currentDocument.title);
  }

  useEffect(() => {
    if (id) {
      loadDocumentAndVersions(id);
    }
  }, [id, loadDocumentAndVersions]);


  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if active content differs from latest committed version (Working Tree Dirty State)
  const isDirty = useMemo(() => {
    if (previewVersionId !== null) return false;
    const cleanLocal = (localContent || "").trim();
    const cleanCurrent = (currentContent || "").trim();
    return cleanLocal !== cleanCurrent;
  }, [localContent, currentContent, previewVersionId]);

  const readingTimeMinutes = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const handleSave = useCallback(async () => {
    if (previewVersionId !== null) return; // Don't save when previewing old version

    try {
      const liveEditorHtml = document.querySelector(".ProseMirror")?.innerHTML?.trim();
      const contentToSave = liveEditorHtml || localContent || currentContent || "<p></p>";
      setLocalContent(contentToSave);

      const result = await saveNewVersion(id, contentToSave, commitMessage);
      if (result?.saved) {
        setCommitMessage("");
        toast.success(`Milestone v${result.version?.versionNumber || ""} committed!`);
      } else {
        toast.info(result?.message || "No changes detected since last version.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to commit version.");
    }
  }, [id, localContent, currentContent, commitMessage, previewVersionId, saveNewVersion, toast]);

  // Ctrl+S / Cmd+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
  };

  const handleTitleSave = async () => {
    if (localTitle.trim() && localTitle.trim() !== currentDocument?.title) {
      await renameDocument(id, localTitle.trim());
      toast.success("Document renamed");
    }
  };

  const handleContentChange = (html) => {
    setLocalContent(html);
  };

  // Open Diff modal for a specific past version compared against current/latest
  const handleOpenDiff = (version) => {
    setDiffBaseVersion(version);
    // Compare against latest version or current active content
    const latest = versions && versions.length > 0 ? versions[0] : null;
    setDiffTargetVersion(latest);
    setIsDiffOpen(true);
  };

  // Open Diff between latest committed version and active working tree
  const handleOpenWorkingDiff = () => {
    if (!versions || versions.length === 0) return;
    const latest = versions[0];
    setDiffBaseVersion(latest);
    setDiffTargetVersion({
      versionNumber: "Working Copy",
      commitMessage: "Uncommitted live changes",
      content: localContent,
      createdAt: new Date().toISOString(),
    });
    setIsDiffOpen(true);
  };

  const handleRestoreFromDiff = async (versionToRestore) => {
    try {
      const result = await restoreVersion(
        id,
        versionToRestore._id,
        `Rollback to v${versionToRestore.versionNumber}`
      );
      if (result?.saved) {
        toast.success(`Restored to version ${versionToRestore.versionNumber}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to restore version");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">Loading document workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !currentDocument) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Document Unavailable</h2>
          <p className="text-sm text-gray-500 mb-6">
            {error || "The document you requested could not be found or you do not have permission to view it."}
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isPreviewingOldVersion = previewVersionId !== null;

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-gray-900 rounded-lg -ml-1 text-xs font-semibold gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Documents
          </Button>

          <span className="text-gray-300">/</span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 truncate max-w-[180px] sm:max-w-[280px]">
              {localTitle || "Untitled Document"}
            </span>

            {/* Git Status Badge */}
            {isPreviewingOldVersion ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Previewing v{versions.find((v) => v._id === previewVersionId)?.versionNumber} (Read Only)
              </span>
            ) : isDirty ? (
              <button
                onClick={handleOpenWorkingDiff}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 px-2 py-0.5 rounded-full transition-colors"
                title="Click to view diff against last commit"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Uncommitted changes
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Up to date (v{currentDocument.currentVersion})
              </span>
            )}
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="h-8 text-xs font-medium rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100 gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              Export
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </Button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-200/80 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    exportAsMarkdown(localTitle, localContent);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                >
                  <FileCode className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-800">Markdown (.md)</p>
                    <p className="text-[10px] text-gray-400">Headings, lists, formatting</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    exportAsHtml(localTitle, localContent);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-800">HTML Document (.html)</p>
                    <p className="text-[10px] text-gray-400">Standalone styled webpage</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    exportAsPlainText(localTitle, localContent);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-800">Plain Text (.txt)</p>
                    <p className="text-[10px] text-gray-400">Raw unformatted text</p>
                  </div>
                </button>

                <div className="my-1 border-t border-gray-100" />

                <button
                  onClick={() => {
                    printDocument(localTitle);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-800">Print / PDF</p>
                    <p className="text-[10px] text-gray-400">Browser print or save as PDF</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <span className="text-xs font-semibold text-gray-600 hidden sm:inline-block px-2">
            {user?.username}
          </span>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Version History & Timeline */}
        <VersionSidebar
          documentId={id}
          onOpenDiff={handleOpenDiff}
        />

        {/* Right Editor Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
          {/* Header Bar: Title Input & Commit Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                className="w-full text-xl sm:text-2xl font-black text-gray-900 bg-transparent border-none outline-none focus:ring-1 focus:ring-gray-300 rounded-lg px-2 -ml-2 transition-all hover:bg-gray-200/50 truncate"
                placeholder="Untitled Document"
              />
            </div>

            {/* Commit Form Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {!isPreviewingOldVersion ? (
                <>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    maxLength={240}
                    placeholder="Commit milestone message..."
                    className="w-48 sm:w-64 h-9 rounded-xl border border-gray-300 bg-white px-3 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 shadow-xs"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        handleSave();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-9 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
                    title="Commit snapshot (Ctrl+S)"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? "Saving..." : "Commit"}
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    Viewing past snapshot
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const latest = versions[0];
                      if (latest) {
                        useVersionStore.getState().setPreviewVersion(null, latest.content);
                      }
                    }}
                    className="h-8 rounded-lg text-xs"
                  >
                    Exit Preview
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Tiptap Rich Text Editor */}
          <div className="flex-1 overflow-hidden">
            <TextEditor
              initialContent={currentContent}
              onChange={handleContentChange}
              readOnly={isPreviewingOldVersion}
            />
          </div>

          {/* Editor Status Footer */}
          <div className="flex items-center justify-between mt-2.5 px-1 shrink-0 text-xs text-gray-500 select-none">
            <div className="flex items-center gap-4">
              <span>
                <strong className="text-gray-700">{wordCount}</strong> {wordCount === 1 ? "word" : "words"}
              </span>
              <span>
                <strong className="text-gray-700">{charCount}</strong> characters
              </span>
              <span className="hidden sm:inline-block text-gray-400">
                ~{readingTimeMinutes} min read
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isDirty && (
                <button
                  onClick={handleOpenWorkingDiff}
                  className="hover:text-gray-900 text-amber-700 font-medium inline-flex items-center gap-1 text-[11px]"
                >
                  <GitCompare className="w-3 h-3" /> View diff
                </button>
              )}
              {!isPreviewingOldVersion && (
                <span className="text-[11px] text-gray-400 hidden sm:inline-block">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono text-gray-700">Ctrl+S</kbd> to commit
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Diff Modal */}
      <DiffViewerModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        oldVersion={diffBaseVersion}
        newVersion={diffTargetVersion}
        onRestore={handleRestoreFromDiff}
      />
    </div>
  );
};

export default EditorPage;
