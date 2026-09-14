import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  FileText,
  GitBranch,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  LogOut,
  Star,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ToastProvider";
import api from "@/utils/api";

const Profile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile details editing state
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/profile");
      setProfile(res.data);
      setUsername(res.data.user?.username || "");
      setFullName(res.data.user?.fullName || "");
      setBio(res.data.user?.bio || "");
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    try {
      setUpdatingProfile(true);
      const res = await api.put("/api/profile", {
        username: username.trim(),
        fullName: fullName.trim(),
        bio: bio.trim(),
      });

      toast.success("Profile updated successfully");
      setProfile((prev) => ({
        ...prev,
        user: res.data.user,
      }));

      // Update local storage and auth store
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser, username: res.data.user.username };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      useAuthStore.setState({ user: updatedUser });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Please fill in both password fields");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    try {
      setChangingPassword(true);
      await api.put("/api/profile/password", { currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password";
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate("/signin");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: FileText,
      label: "Total Documents",
      value: profile?.stats?.totalDocuments ?? 0,
    },
    {
      icon: Star,
      label: "Starred Documents",
      value: profile?.stats?.starredDocuments ?? 0,
    },
    {
      icon: GitBranch,
      label: "Committed Versions",
      value: profile?.stats?.totalVersions ?? 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-200/90">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <div className="w-2 h-2 rounded-full bg-gray-900" />
              <div className="w-2 h-2 rounded-full bg-gray-900" />
              <div className="w-2 h-2 rounded-full bg-gray-900" />
            </div>
            Kodoc
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-gray-900 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900 text-xs font-semibold"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          Sign Out
        </Button>
      </nav>

      {/* Profile Page Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Account & Preferences
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal profile, credentials, and track your authoring stats.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="bg-white border-gray-200/80 shadow-xs rounded-2xl p-5"
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-800">
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Info & Edit Card */}
        <Card className="bg-white border-gray-200/80 shadow-xs rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {profile?.user?.username || user?.username || "User"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {profile?.user?.email || user?.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Member since {profile?.user?.createdAt ? formatDate(profile.user.createdAt) : "Recently"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" /> Personal Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="username" className="text-xs font-semibold text-gray-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-10 rounded-xl bg-gray-50 border-gray-200 text-xs focus-visible:ring-1 focus-visible:ring-gray-900"
                    placeholder="Username"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold text-gray-700">
                    Full Name (Optional)
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 rounded-xl bg-gray-50 border-gray-200 text-xs focus-visible:ring-1 focus-visible:ring-gray-900"
                    placeholder="e.g. Bhavishya Agrawal"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bio" className="text-xs font-semibold text-gray-700">
                  Bio / Headline
                </Label>
                <Input
                  id="bio"
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={240}
                  className="h-10 rounded-xl bg-gray-50 border-gray-200 text-xs focus-visible:ring-1 focus-visible:ring-gray-900"
                  placeholder="e.g. 4th-year B.Tech CSE student writing tech briefs"
                />
              </div>

              <Button
                type="submit"
                disabled={updatingProfile}
                className="h-9 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-all"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {updatingProfile ? "Saving..." : "Save Profile Details"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="bg-white border-gray-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-gray-700" />
              <h3 className="text-sm font-bold text-gray-900">
                Security & Password
              </h3>
            </div>

            {passwordError && (
              <Alert variant="destructive" className="mb-4 py-2 px-3 text-xs">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="currentPassword"
                  className="text-xs font-semibold text-gray-700"
                >
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 pr-10 rounded-xl bg-gray-50 border-gray-200 text-xs focus-visible:ring-1 focus-visible:ring-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="newPassword"
                  className="text-xs font-semibold text-gray-700"
                >
                  New Password (min. 6 characters)
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 pr-10 rounded-xl bg-gray-50 border-gray-200 text-xs focus-visible:ring-1 focus-visible:ring-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={changingPassword}
                className="h-9 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-all"
              >
                {changingPassword ? "Updating..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
