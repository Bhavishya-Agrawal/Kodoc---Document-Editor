# Kodoc — Vercel Deployment Guide

A step-by-step guide to deploy the Kodoc full-stack MERN application on Vercel for free.

---

## Prerequisites

- A [GitHub](https://github.com) account with your Kodoc repository pushed
- A free [Vercel](https://vercel.com) account (sign up with GitHub)
- A free [MongoDB Atlas](https://cloud.mongodb.com) account

---

## Step 1: Set Up MongoDB Atlas (Free Cloud Database)

Your local MongoDB (`localhost:27017`) won't be accessible from Vercel's cloud servers. You need a cloud-hosted MongoDB instance.

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free account
2. **Create a Free Cluster**:
   - Click "Build a Database" → Select **M0 Free Tier**
   - Choose a cloud provider and region closest to you
   - Click "Create Cluster" (takes ~2 minutes)
3. **Create a Database User**:
   - Go to **Database Access** → **Add New Database User**
   - Choose "Password" authentication
   - Set a username and a strong password (avoid special characters like `@`, `%` in the password to prevent URL encoding issues)
   - Set privileges to **"Read and Write to Any Database"**
   - Click "Add User"
4. **Whitelist All IPs** (required for Vercel's dynamic IPs):
   - Go to **Network Access** → **Add IP Address**
   - Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - Click "Confirm"
5. **Get Your Connection String**:
   - Go to **Database** → Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string. It will look like:
     ```
     mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add your database name before the `?`:
     ```
     mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/kodoc?retryWrites=true&w=majority
     ```

---

## Step 2: Push Your Code to GitHub

Make sure your code is pushed to a GitHub repository:

```bash
# In the project root (Kodoc - Document Editor)
git init
git add .
git commit -m "Initial commit - Kodoc Document Editor"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kodoc.git
git push -u origin main
```

> **Important**: The `.gitignore` file will ensure `node_modules/`, `.env` files, and `dist/` are NOT pushed to GitHub.

---

## Step 3: Deploy on Vercel

### Option A: Full-Stack Monorepo (Recommended)

This deploys both the React frontend and the Express API on the same Vercel project, sharing the same domain. No CORS issues.

1. Go to [vercel.com](https://vercel.com) → **"Add New Project"**
2. **Import your GitHub repository** → Select the Kodoc repo
3. **Configure the project**:
   - **Framework Preset**: Select `Other` (not Vite — we handle build ourselves)
   - **Root Directory**: Leave as `.` (the repository root)
   - **Build Command**: `npm run build --prefix frontend`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install --prefix server && npm install --prefix frontend`
4. **Add Environment Variables** (click "Environment Variables"):

   | Variable | Value |
   |----------|-------|
   | `MONGO_URI` | `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kodoc?retryWrites=true&w=majority` |
   | `JWT_SECRET` | A strong random string (e.g. `k0d0c_pr0d_s3cr3t_2024_xyz`) |
   | `NODE_ENV` | `production` |

5. Click **"Deploy"**

The `vercel.json` in the project root handles routing:
- `/api/*` requests → Serverless Express function (`api/index.js`)
- Everything else → React SPA (`index.html`)

### Option B: Separate Frontend + Backend

If you prefer deploying frontend and backend separately:

**Frontend on Vercel:**
1. Import your repo → Set Root Directory to `frontend`
2. Framework Preset: `Vite`
3. Add env variable: `VITE_BACKEND_URL=https://your-backend-url.onrender.com`
4. The `frontend/vercel.json` handles SPA routing automatically

**Backend on Render/Railway:**
1. Create a new Web Service on [Render](https://render.com)
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add the same `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL` env variables

---

## Step 4: Verify Deployment

1. Open your Vercel deployment URL (e.g. `https://kodoc-xxxx.vercel.app`)
2. Test the following:
   - ✅ Sign up / Sign in works
   - ✅ Create a new document
   - ✅ Edit, save, and commit versions
   - ✅ Dashboard loads correctly
   - ✅ Refreshing on `/dashboard` or `/editor/:id` doesn't give a 404
   - ✅ Profile page loads and updates

---

## Troubleshooting

### "CORS Error" in browser console
- **If using Option A (monorepo)**: This shouldn't happen since frontend and API share the same domain. Check that your `vercel.json` rewrites are correct.
- **If using Option B (separate)**: Make sure `FRONTEND_URL` is set in your backend env variables to your Vercel frontend domain.

### "MongoNetworkError" or "Connection refused"
- Make sure you've whitelisted `0.0.0.0/0` in MongoDB Atlas Network Access
- Verify your `MONGO_URI` doesn't have a typo — especially check the password and database name
- Ensure you replaced `<password>` with your actual password (no angle brackets)

### "Cannot find module" errors on Vercel
- The `api/index.js` file imports from `../server/...`. Make sure the file structure is correct and you've pushed all files to GitHub

### Client-side routes return 404 on refresh
- The `vercel.json` SPA rewrite (`"/(.*)" → "/index.html"`) should handle this. Make sure it's in the correct directory (root for Option A, `frontend/` for Option B)

### "Function timed out" on Vercel
- Vercel serverless functions have a 10-second timeout on the free plan
- MongoDB cold starts can be slow. The cached connection in `server/config/db.js` minimizes this, but the very first request after a long idle period may be slow

---

## Interview Defense: How Serverless MERN Works on Vercel

> **Q: How does your Express backend run on Vercel without a traditional server?**
>
> Vercel deploys each file in the `/api` directory as an independent serverless function. Our `api/index.js` imports the full Express app and the cached MongoDB connection. When a request hits `/api/*`, Vercel invokes this function, which connects to MongoDB (reusing an existing connection if the container is warm) and delegates to Express's router. The key insight is that Express is just a request handler — `app(req, res)` works the same whether called by `http.createServer` or a serverless runtime.

> **Q: What's the difference between running locally and on Vercel?**
>
> Locally, `server.js` calls `app.listen()` to start a long-running HTTP server. On Vercel, `api/index.js` exports a handler function that Vercel calls per-request — no `listen()` needed. The Express app, routes, and database logic are identical in both cases. We extracted the app configuration into `app.js` specifically to enable this dual-use pattern.

> **Q: How do you handle MongoDB connections in serverless?**
>
> Serverless containers are frozen after each request and thawed for the next one. Without connection caching, every request would open a new connection, quickly hitting MongoDB Atlas's connection limit (500 on free tier). Our `connectDB()` function checks `mongoose.connection.readyState` — if already connected, it reuses the existing connection. This is a standard pattern recommended by MongoDB's official Vercel integration guide.
