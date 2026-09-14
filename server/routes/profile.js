import express from "express";
import User from "../models/User.js";
import Document from "../models/Document.js";
import Version from "../models/Version.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// GET /api/profile
// Get the authenticated user's profile info + stats
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get document count
    const totalDocuments = await Document.countDocuments({ owner: req.user.id });
    const starredDocuments = await Document.countDocuments({ owner: req.user.id, isStarred: true });

    // Get total versions across all user's documents
    const userDocIds = await Document.find({ owner: req.user.id }).select("_id");
    const docIds = userDocIds.map((doc) => doc._id);
    const totalVersions = await Version.countDocuments({ documentId: { $in: docIds } });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || "",
        bio: user.bio || "",
        createdAt: user.createdAt,
      },
      stats: {
        totalDocuments,
        starredDocuments,
        totalVersions,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/profile
// Update user profile information (username, fullName, bio)
router.put("/", async (req, res) => {
  try {
    const { username, fullName, bio } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username !== undefined && username.trim()) {
      user.username = username.trim();
    }

    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || "",
        bio: user.bio || "",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});


// PUT /api/profile/password
// Change the authenticated user's password
router.put("/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new password" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password (the pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
