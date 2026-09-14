import express from "express";
import Document from "../models/Document.js";
import Version from "../models/Version.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// GET /api/stats
// Get dashboard statistics for the authenticated user
router.get("/", async (req, res) => {
  try {
    // Total documents
    const totalDocuments = await Document.countDocuments({ owner: req.user.id });

    // Documents updated in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentDocuments = await Document.countDocuments({
      owner: req.user.id,
      updatedAt: { $gte: sevenDaysAgo },
    });

    // Total versions across all documents
    const userDocIds = await Document.find({ owner: req.user.id }).select("_id");
    const docIds = userDocIds.map((doc) => doc._id);
    const totalVersions = await Version.countDocuments({ documentId: { $in: docIds } });

    res.json({
      totalDocuments,
      recentDocuments,
      totalVersions,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
