import connectDB from "../server/config/db.js";
import app from "../server/app.js";

/**
 * Vercel Serverless Function entry point.
 * 
 * Vercel automatically detects files in the /api directory and
 * deploys them as serverless functions. This file connects to
 * MongoDB (using cached connection) and delegates all requests
 * to the Express app.
 * 
 * The vercel.json rewrites `/api/(.*)` to this function,
 * so all API routes (e.g. /api/auth/signup, /api/documents)
 * are handled by Express as normal.
 */
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
