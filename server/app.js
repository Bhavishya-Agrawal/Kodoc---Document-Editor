import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import our routes
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
import versionRoutes from "./routes/versions.js";
import profileRoutes from "./routes/profile.js";
import statsRoutes from "./routes/stats.js";

// Load environment variables if we have a .env file
dotenv.config();

const app = express();

// Middleware
// CORS: Allow requests from local dev and production Vercel domains
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,  // e.g. https://kodoc.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (server-to-server, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In production on same Vercel domain, origin will match
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // Allows us to read JSON data from the frontend requests

// Basic route to check if server is running
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Kodoc API is running!" });
});

// Setup API Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
// We mount versions under documents as well, or separate, based on preference.
// In the brief: /api/documents/:docId/versions. So we can mount it under /api/documents or handle it directly in version routes.
// To keep it simple, we will mount versionRoutes at /api/documents
app.use("/api/documents", versionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/stats", statsRoutes);

// Global error handler — catches unhandled errors from route handlers
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server." });
});

export default app;
