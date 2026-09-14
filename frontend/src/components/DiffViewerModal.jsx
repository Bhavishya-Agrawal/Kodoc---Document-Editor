import { useState, useMemo, useEffect } from "react";
import { X, GitCompare, RotateCcw, Plus, Minus, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { diffWords, diffLines } from "diff";

// Helper to convert HTML string to structured clean text for diffing
const htmlToText = (html = "") => {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Replace block elements with line breaks before textContent extraction
  const blocks = temp.querySelectorAll("p, h1, h2, h3, li, blockquote, div, tr");
  blocks.forEach((b) => {
    b.prepend(document.createTextNode("\n"));
  });

  return (temp.textContent || temp.innerText || "").trim();
};

export default function DiffViewerModal({
  isOpen,
  onClose,
  oldVersion,
  newVersion,
  onRestore,
}) {
  const [diffMode, setDiffMode] = useState("words"); // 'words' | 'lines'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const oldText = useMemo(() => {
    return htmlToText(oldVersion?.content || "");
  }, [oldVersion]);

  const newText = useMemo(() => {
    return htmlToText(newVersion?.content || "");
  }, [newVersion]);

  const diffChunks = useMemo(() => {
    if (!oldText && !newText) return [];
    if (diffMode === "lines") {
      return diffLines(oldText, newText);
    }
    return diffWords(oldText, newText);
  }, [oldText, newText, diffMode]);

  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    diffChunks.forEach((chunk) => {
      if (chunk.added) additions += chunk.count || 1;
      if (chunk.removed) deletions += chunk.count || 1;
    });
    return { additions, deletions };
  }, [diffChunks]);

  if (!isOpen || !oldVersion) return null;

  const oldVersionTitle = `v${oldVersion.versionNumber}`;
  const newVersionTitle = newVersion
    ? `v${newVersion.versionNumber}`
    : "Current Working Draft";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  Version Comparison (Git Diff)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
                  {oldVersionTitle} ➔ {newVersionTitle}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Inspect changes between revisions before restoring or continuing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Diff mode toggle */}
            <div className="hidden sm:flex bg-gray-200/80 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setDiffMode("words")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  diffMode === "words"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Word Diff
              </button>
              <button
                onClick={() => setDiffMode("lines")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  diffMode === "lines"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Line Diff
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata Comparison Subheader */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 py-3 bg-gray-100/50 border-b border-gray-200 text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">
              Base: {oldVersionTitle}
            </span>
            <p className="font-medium text-gray-900 truncate">
              "{oldVersion.commitMessage || "No commit message"}"
            </p>
            <p className="text-gray-500">
              {new Date(oldVersion.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">
              Target: {newVersionTitle}
            </span>
            <p className="font-medium text-gray-900 truncate">
              {newVersion
                ? `"${newVersion.commitMessage || "No commit message"}"`
                : "Active editor state"}
            </p>
            <p className="text-gray-500">
              {newVersion
                ? new Date(newVersion.createdAt).toLocaleString()
                : "Live working buffer"}
            </p>
          </div>
        </div>

        {/* Diff Stats Banner */}
        <div className="px-6 py-2 bg-white border-b border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <Plus className="w-3.5 h-3.5" /> {stats.additions} additions
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              <Minus className="w-3.5 h-3.5" /> {stats.deletions} deletions
            </span>
          </div>
          <span className="text-gray-400 text-[11px]">
            {stats.additions === 0 && stats.deletions === 0
              ? "Versions are identical"
              : "Differences highlighted below"}
          </span>
        </div>

        {/* Diff Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed bg-white">
          {stats.additions === 0 && stats.deletions === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No content differences detected.</p>
              <p className="text-xs text-gray-400 mt-1">
                Both versions share the exact same text content.
              </p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words rounded-xl border border-gray-100 bg-gray-50/50 p-5">
              {diffChunks.map((chunk, index) => {
                if (chunk.added) {
                  return (
                    <span
                      key={index}
                      className="bg-emerald-100 text-emerald-900 font-semibold px-1 py-0.5 rounded mx-0.5 border-b border-emerald-400"
                    >
                      {chunk.value}
                    </span>
                  );
                }
                if (chunk.removed) {
                  return (
                    <span
                      key={index}
                      className="bg-rose-100 text-rose-900 line-through px-1 py-0.5 rounded mx-0.5 border-b border-rose-400 opacity-80"
                    >
                      {chunk.value}
                    </span>
                  );
                }
                return (
                  <span key={index} className="text-gray-700">
                    {chunk.value}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="text-xs text-gray-500">
            Green: added in {newVersionTitle} · Red: removed from {oldVersionTitle}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl border-gray-200"
            >
              Close
            </Button>

            {onRestore && (
              <Button
                size="sm"
                onClick={() => {
                  onRestore(oldVersion);
                  onClose();
                }}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore {oldVersionTitle}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
