# Kodoc — Git for Documents

> A full-stack document editor with built-in version control and visual diff inspection. Write naturally, commit milestones, compare revisions, and travel through your document's history — like Git, but for documents.

---

## 🎯 Overview

**Kodoc** is a production-ready MERN stack web application that introduces Git-inspired version control primitives to rich text document authoring. Every save creates an immutable snapshot checkpoint accompanied by a commit message and metadata. Users can track revisions, inspect visual additions and deletions side-by-side or inline, star favorite files, duplicate projects, export in multiple formats, and safely roll back to any historical state.

---

## ✨ Features

### 📝 Core Editing & Workspace
- **Rich Text Editor**: Built on Tiptap (ProseMirror engine) supporting headings (H1-H3), bold, italic, strikethrough, bullet & numbered lists, blockquotes, code blocks, and dividers.
- **Git Working Tree Status**: Real-time change detection showing `● Uncommitted changes` vs `✓ Up to date` state.
- **Multi-Format Document Export**:
  - Markdown (`.md`)
  - Standalone HTML with styled typography (`.html`)
  - Plain Text (`.txt`)
  - Print / Save as PDF (`window.print()`)
- **Reading Metrics**: Real-time word count, character count, and estimated reading time.
- **Inline Renaming & Keyboard Shortcuts**: Instant renaming, `Ctrl+S` quick commit, and `Ctrl+Enter` commit dispatch.

### 🌿 Git-Inspired Version Control
- **Immutable Milestones**: Each commit records version number, author, timestamp, commit message, word count, and byte size.
- **Visual Diff Viewer**: Compare any historical snapshot against the latest commit or live draft with:
  - **Word-by-Word Diff** (green highlights for additions, red strikethrough for deletions).
  - **Line-by-Line Unified Diff**.
- **Instant Rollback & Restore**: Revert to any previous version; creates an auditable restore commit without destroying subsequent history.
- **Commit Timeline Search**: Filter and search through historical commit messages and version tags.

### 📊 Document Management & Dashboard
- **Star / Favorite System**: Pin priority documents and toggle between *All Documents* and *Starred* views.
- **1-Click Duplication**: Clone documents along with their latest draft content.
- **Sorting & Filtering**: Sort dynamically by Newest First, Oldest First, or Alphabetical (A-Z).
- **Workspace Analytics**: Live stats displaying total documents, starred documents, and total version checkpoints recorded.
- **Custom Confirmation Modals**: Safe deletion dialogs preventing accidental data loss.

### 🛡️ Authentication & Profile Security
- **JWT Authentication**: Token-based security stored in localStorage with Authorization headers.
- **Password Hashing**: Secure salted bcrypt password hashing.
- **Profile Customization**: Update display name, bio, and credentials with instant store synchronization.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Role | Description |
|---|---|---|
| **React 19** | View Layer | Modern component architecture with hooks and concurrent features |
| **Vite 7** | Build Tool | Lightning-fast HMR and optimized production bundling |
| **Tiptap 2 (ProseMirror)** | Rich Text Engine | Extensible headless rich text editor framework |
| **Tailwind CSS 4** | Styling | Utility-first styling with modern aesthetic dark graphite accents |
| **Zustand** | State Management | Lightweight reactive state stores (`useAuthStore`, `useDocumentStore`, `useVersionStore`) |
| **Diff** | Diffing Engine | Word and line level Myers-diff algorithm implementation |
| **React Router 7** | Routing | Client-side routing with protected route guards |
| **Axios** | HTTP Client | REST API requests with authorization interceptors |
| **Lucide React** | Icons | Consistent modern icon system |

### Backend
| Technology | Role | Description |
|---|---|---|
| **Node.js** | Runtime | Asynchronous event-driven JavaScript runtime |
| **Express** | Web Framework | REST API route handling and middleware pipeline |
| **MongoDB** | Database | Flexible document store for nested versions and rich text |
| **Mongoose** | ODM | Schema validation, relationship indexing, and query building |
| **JWT** | Auth | Stateless token-based user authentication |
| **bcryptjs** | Security | One-way password hashing with salt rounds |

---

## 📁 Project Structure

```
Kodoc/
├── frontend/                     # Client application (React + Vite)
│   ├── src/
│   │   ├── components/           # UI Components
│   │   │   ├── ui/               # Reusable primitives (buttons, inputs, cards)
│   │   │   ├── DeleteConfirmModal.jsx # Accessible delete confirmation modal
│   │   │   ├── DiffViewerModal.jsx    # Word & line visual diff inspector
│   │   │   ├── ErrorBoundary.jsx      # Fallback UI for React lifecycle errors
│   │   │   ├── Navbar.jsx             # Top bar navigation
│   │   │   ├── ProtectedRoute.jsx     # Auth guard route wrapper
│   │   │   ├── TextEditor.jsx         # Tiptap toolbar & prose editor
│   │   │   ├── ToastProvider.jsx      # Global toast notification context
│   │   │   └── VersionSidebar.jsx     # Version history timeline & diff trigger
│   │   ├── pages/
│   │   │   ├── auth/             # Signin.jsx, Signup.jsx
│   │   │   ├── user/             # Dashboard.jsx, EditorPage.jsx, Profile.jsx
│   │   │   ├── LandingPage.jsx   # Hero marketing page
│   │   │   └── NotFound.jsx      # 404 handler
│   │   ├── store/                # Zustand State Stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useDocumentStore.js
│   │   │   └── useVersionStore.js
│   │   ├── utils/
│   │   │   └── exportDocument.js # Markdown, HTML, TXT, and PDF converters
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                       # Server application (Node + Express)
│   ├── middleware/
│   │   └── auth.js               # JWT bearer verification middleware
│   ├── models/
│   │   ├── Document.js           # Document schema (title, owner, isStarred, wordCount)
│   │   ├── User.js               # User schema (username, email, password, fullName, bio)
│   │   └── Version.js            # Immutable version schema (content, wordCount, size)
│   ├── routes/
│   │   ├── auth.js               # /api/auth/signup & /api/auth/signin
│   │   ├── documents.js          # CRUD, /:id/star, /:id/duplicate
│   │   ├── profile.js            # /api/profile GET, PUT & password updates
│   │   ├── stats.js              # /api/stats aggregation queries
│   │   └── versions.js           # Version creation, listing, and restore
│   ├── utils/
│   │   └── versioning.js         # Content normalization & word counting
│   ├── server.js                 # Server entry point
│   ├── test-e2e-full.js          # Automated end-to-end integration test suite
│   ├── .env                      # Environment config
│   └── package.json
│
├── package.json                  # Workspace management
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local `mongod` service or MongoDB Atlas cluster connection string)
- **npm** (Bundled with Node.js)

### 1. Clone & Install
```bash
git clone <repo-url>
cd "Kodoc - Document Editor"
```

### 2. Configure Environment Variables

**Server (`server/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/kodoc
JWT_SECRET=kodoc_super_secret_jwt_key_2026
```

**Frontend (`frontend/.env`):**
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Run the Application

From project root:
```bash
# Terminal 1 — Start Backend Server
cd server
node server.js

# Terminal 2 — Start Frontend
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

An automated full-stack integration test suite is included in `server/test-e2e-full.js`. It validates registration, profile modification, document creation, multi-version snapshots, diffing, rollback, starring, duplication, and metrics.

To run the suite:
```bash
cd server
node test-e2e-full.js
```

---

## 📡 Complete API Reference

### Authentication
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register user account |
| `POST` | `/api/auth/signin` | Authenticate and issue JWT |

### Documents (Protected)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/documents` | Fetch all user documents |
| `POST` | `/api/documents` | Create a new document |
| `GET` | `/api/documents/:id` | Fetch document details and latest content |
| `PUT` | `/api/documents/:id` | Update document title and word count |
| `PATCH` | `/api/documents/:id/star` | Toggle starred status |
| `POST` | `/api/documents/:id/duplicate` | Clone document and latest draft |
| `DELETE` | `/api/documents/:id` | Delete document and cascade delete versions |

### Versions (Protected)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/documents/:docId/versions` | List all version milestones (newest first) |
| `POST` | `/api/documents/:docId/versions` | Commit a new version snapshot |
| `GET` | `/api/documents/:docId/versions/:versionId` | Retrieve specific historical version |
| `POST` | `/api/documents/:docId/versions/:versionId/restore` | Rollback to specific version |

### Profile & Stats (Protected)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/profile` | Retrieve profile and authoring stats |
| `PUT` | `/api/profile` | Update username, full name, and bio |
| `PUT` | `/api/profile/password` | Change password with old password verification |
| `GET` | `/api/stats` | Aggregate dashboard metrics |

---

## 🎓 Academic Defense & Interview Guide

See [`INTERVIEW_DEFENSE.md`](./INTERVIEW_DEFENSE.md) for detailed architectural justifications, database design trade-offs, and sample interview Q&A tailored for 4th-year B.Tech CSE placements.
