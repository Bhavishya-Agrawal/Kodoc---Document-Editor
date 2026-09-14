import app from "./app.js";
import connectDB from "./config/db.js";

/**
 * Local development entry point.
 * Connects to MongoDB and starts the HTTP server on PORT.
 * 
 * In production (Vercel), api/index.js is used instead — it imports
 * the same `app` and `connectDB` but runs as a serverless function
 * without calling app.listen().
 */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
