import { useState } from "react";
import { Clock, RotateCcw, GitCompare, Search, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVersionStore } from "@/store/useVersionStore";
import { useToast } from "@/components/ToastProvider";

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const formatBytes = (bytes = 0) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const VersionSidebar = ({ documentId, onOpenDiff }) => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const { versions, restoreVersion, saving, setPreviewVersion, previewVersionId } =
    useVersionStore();

  const handleRestore = async (version) => {
    try {
      const result = await restoreVersion(
        documentId,
        version._id,
        `Rollback to v${version.versionNumber}`
      );
      if (result?.saved) {
        toast.success(`Successfully restored version ${version.versionNumber}`);
      } else {
        toast.info(result?.message || "Restore skipped. No changes detected.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to restore version");
    }
  };

  const handlePreview = (version) => {
    const latestVersionNum = Math.max(...versions.map((v) => v.versionNumber));
    if (version.versionNumber === latestVersionNum) {
      setPreviewVersion(null, version.content);
    } else {
      setPreviewVersion(version._id, version.content);
    }
  };

  if (!versions || versions.length === 0) {
    return (
      <div className="w-72 bg-gray-50 border-r border-gray-200 p-6 flex flex-col items-center justify-center text-center text-sm text-gray-500">
        <Clock className="w-8 h-8 text-gray-300 mb-2" />
        <p className="font-semibold text-gray-700">No versions yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Save your first milestone to begin tracking changes.
        </p>
      </div>
    );
  }

  const latestVersionNum = Math.max(...versions.map((v) => v.versionNumber));

  const filteredVersions = versions.filter((v) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.versionNumber.toString().includes(term) ||
      (v.commitMessage && v.commitMessage.toLowerCase().includes(term))
    );
  });

  return (
    <div className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col h-[calc(100vh-65px)] select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-gray-200 bg-white space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-700" /> Version History
          </h2>
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {versions.length} {versions.length === 1 ? "commit" : "commits"}
          </span>
        </div>

        {/* Search filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search commits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 pr-2 text-xs rounded-lg bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-900"
          />
        </div>
      </div>

      {/* Version Timeline List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredVersions.map((version) => {
          const isLatest = version.versionNumber === latestVersionNum;
          const isActive =
            previewVersionId === version._id ||
            (isLatest && previewVersionId === null);

          return (
            <div
              key={version._id}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "border-gray-900 bg-white shadow-sm ring-1 ring-gray-900"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs"
              }`}
              onClick={() => handlePreview(version)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900">
                    v{version.versionNumber}
                  </span>
                  {isLatest && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                      Latest
                    </span>
                  )}
                  {version.action === "restore" && (
                    <span className="text-[10px] uppercase font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded-full">
                      Restored
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-400">
                  {formatTimeAgo(version.createdAt)}
                </span>
              </div>

              {/* Commit Message */}
              <p className="text-xs text-gray-700 font-medium line-clamp-2 mb-2 leading-snug">
                "{version.commitMessage || "No commit message"}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2.5">
                <span>
                  {new Date(version.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>{formatBytes(version.contentSizeBytes)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-[11px] rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenDiff) onOpenDiff(version);
                  }}
                  title="Compare with latest"
                >
                  <GitCompare className="w-3 h-3 mr-1 text-gray-600" />
                  Diff
                </Button>

                {!isLatest && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-[11px] rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100"
                    disabled={saving}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(version);
                    }}
                    title="Roll back to this version"
                  >
                    <RotateCcw className="w-3 h-3 mr-1 text-gray-600" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {filteredVersions.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-6">
            No matching versions found.
          </p>
        )}
      </div>
    </div>
  );
};

export default VersionSidebar;
