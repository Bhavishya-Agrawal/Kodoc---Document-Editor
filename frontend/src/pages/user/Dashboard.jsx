import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  File,
  Plus,
  Search,
  Home,
  Menu,
  X,
  LogOut,
  Trash2,
  User,
  GitBranch,
  ArrowUpDown,
  Star,
  Copy,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ToastProvider";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "alpha", label: "A — Z" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    documents,
    loading,
    loadDocuments,
    createDocument,
    deleteDocument,
    toggleStarDocument,
    duplicateDocument,
    stats,
    fetchStats,
  } = useDocumentStore();
  const { user, logout } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'starred'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadDocuments();
    fetchStats();
  }, [loadDocuments, fetchStats]);

  const handleCreateNew = async () => {
    try {
      const result = await createDocument("Untitled Document");
      const docId = result?.document?._id || result?._id;
      if (docId) {
        navigate(`/editor/${docId}`);
        toast.success("New document created!");
      } else {
        toast.error("Failed to create document");
      }
    } catch (err) {
      console.error("Failed to create document", err);
      toast.error(err.message || "Failed to create document");
    }
  };

  const handleDuplicate = async (docId, title, e) => {
    e.stopPropagation();
    try {
      await duplicateDocument(docId);
      toast.success(`Duplicated "${title}"`);
    } catch (err) {
      toast.error(err.message || "Failed to duplicate document");
    }
  };

  const handleToggleStar = async (docId, e) => {
    e.stopPropagation();
    await toggleStarDocument(docId);
  };

  const handlePromptDelete = (doc, e) => {
    e.stopPropagation();
    setDocToDelete(doc);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDocument(docToDelete._id);
      toast.success("Document deleted successfully");
      setDeleteModalOpen(false);
      setDocToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/signin");
  };

  // Filter documents by tab and search
  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filterTab === "starred") return Boolean(doc.isStarred);
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      }
      if (sortBy === "alpha") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const starredCount = documents.filter((d) => d.isStarred).length;

  const cycleSortOption = () => {
    const currentIndex = SORT_OPTIONS.findIndex((o) => o.value === sortBy);
    const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length;
    setSortBy(SORT_OPTIONS[nextIndex].value);
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  const sidebarItems = [
    { icon: Home, label: "Dashboard", active: true, action: () => {} },
    { icon: User, label: "Profile", active: false, action: () => navigate("/profile") },
  ];

  const statCards = [
    {
      icon: FileText,
      label: "Total Documents",
      value: stats?.totalDocuments ?? documents.length,
      subtext: "In your workspace",
    },
    {
      icon: Star,
      label: "Starred",
      value: starredCount,
      subtext: "Marked as priority",
    },
    {
      icon: GitBranch,
      label: "Total Milestones",
      value: stats?.totalVersions ?? documents.reduce((sum, d) => sum + (d.currentVersion || 1), 0),
      subtext: "Versions recorded",
    },
  ];

  return (
    <div className="min-h-screen flex flex-row bg-gray-50/60 font-sans">
      {/* Sidebar Navigation */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200/90 shadow-lg lg:shadow-none transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:w-64 lg:flex-shrink-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Brand Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2.5 font-bold text-lg text-gray-900 tracking-tight">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <div className="w-2 h-2 rounded-full bg-gray-900" />
                <div className="w-2 h-2 rounded-full bg-gray-900" />
                <div className="w-2 h-2 rounded-full bg-gray-900" />
              </div>
              <span>Kodoc</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-1.5">
              {sidebarItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={item.action}
                    className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-all duration-150
                    ${
                      item.active
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Account Info & Logout */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-col gap-2.5">
              <div
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-200/80 cursor-pointer hover:border-gray-300 transition-colors shadow-2xs"
                onClick={() => navigate("/profile")}
              >
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {user?.username || "User"}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                className="w-full text-xs font-medium bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl justify-center gap-2 h-9"
                variant="ghost"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full overflow-hidden">
        <div className="p-6 lg:p-10 max-h-screen overflow-y-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Document Workspace
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Track every revision, commit milestones, and restore with confidence.
                </p>
              </div>

              <Button
                onClick={handleCreateNew}
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                New Document
              </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {statCards.map((stat) => (
                <Card
                  key={stat.label}
                  className="bg-white border-gray-200/80 shadow-xs hover:shadow-sm transition-all rounded-2xl p-5"
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800">
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {stat.subtext}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Controls: Search, Filter Tabs, Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex bg-gray-200/70 p-1 rounded-xl text-xs font-semibold self-start">
                <button
                  onClick={() => setFilterTab("all")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    filterTab === "all"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Documents ({documents.length})
                </button>
                <button
                  onClick={() => setFilterTab("starred")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    filterTab === "starred"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Starred ({starredCount})
                </button>
              </div>

              {/* Search & Sort Container */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 bg-white border-gray-200 rounded-xl text-xs shadow-2xs focus-visible:ring-1 focus-visible:ring-gray-900"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={cycleSortOption}
                  className="h-9 px-3 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold gap-1.5"
                  title="Cycle sort order"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{currentSortLabel}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Document Grid */}
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">
                {filterTab === "starred"
                  ? "Starred Documents"
                  : searchTerm
                  ? "Search Results"
                  : "All Documents"}
              </h2>
              <span className="text-xs text-gray-400">
                Showing {filteredDocuments.length} of {documents.length}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <FileText className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  {filterTab === "starred"
                    ? "No starred documents"
                    : searchTerm
                    ? "No matching documents"
                    : "No documents yet"}
                </h3>
                <p className="text-xs text-gray-500 mb-5 max-w-xs">
                  {filterTab === "starred"
                    ? "Click the star icon on any document card to pin it here."
                    : searchTerm
                    ? "Try adjusting your search keywords."
                    : "Create your first document to start drafting and versioning."}
                </p>
                {!searchTerm && filterTab === "all" && (
                  <Button
                    onClick={handleCreateNew}
                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create First Document
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card
                    key={doc._id}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200/90 hover:border-gray-400/80 bg-white rounded-2xl overflow-hidden flex flex-col justify-between"
                    onClick={() => navigate(`/editor/${doc._id}`)}
                  >
                    <CardContent className="p-0 flex flex-col h-full justify-between">
                      {/* Document Preview Card Header */}
                      <div className="h-32 bg-gradient-to-b from-gray-50 to-gray-100/70 border-b border-gray-100 p-3 relative flex items-center justify-center group-hover:from-gray-100 group-hover:to-gray-200/60 transition-colors">
                        {/* Centered Document Icon */}
                        <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-gray-200 flex items-center justify-center text-gray-700">
                          <File className="w-5 h-5" />
                        </div>

                        {/* Top Action Overlay (Star, Duplicate, Delete) */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                          {/* Star Button */}
                          <button
                            onClick={(e) => handleToggleStar(doc._id, e)}
                            className={`p-1.5 rounded-lg transition-all ${
                              doc.isStarred
                                ? "text-amber-500 bg-amber-50"
                                : "text-gray-400 hover:text-gray-600 hover:bg-white/80"
                            }`}
                            title={doc.isStarred ? "Unstar document" : "Star document"}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                doc.isStarred ? "fill-amber-400" : ""
                              }`}
                            />
                          </button>

                          {/* Duplicate Button */}
                          <button
                            onClick={(e) => handleDuplicate(doc._id, doc.title, e)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Duplicate document"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => handlePromptDelete(doc, e)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Document Metadata Body */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-gray-700 transition-colors flex-1">
                            {doc.title}
                          </h3>
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md flex-shrink-0">
                            v{doc.currentVersion || 1}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span>
                            {doc.wordCount || 0} {doc.wordCount === 1 ? "word" : "words"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Trigger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden w-12 h-12 bg-gray-900 rounded-full shadow-lg text-white flex items-center justify-center z-30"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={docToDelete?.title}
        loading={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
